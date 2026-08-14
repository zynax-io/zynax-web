---
id: architecture
title: Architecture
sidebar_label: Architecture
sidebar_position: 4
description: How the Zynax control plane works — three layers, the workflow IR, engine adapters for Temporal and Argo, and capability dispatch.
---

# Architecture

Zynax is a **control plane**, not a workflow engine. It compiles declarative
intent into an engine-agnostic representation and hands that to whichever engine
adapter is configured. This page covers the parts you need to reason about the
system; the exhaustive design document is
[`ARCHITECTURE.md`](https://github.com/zynax-io/zynax/blob/main/ARCHITECTURE.md)
in the product repository.

## Three-layer separation

```text
┌──────────────────────────────────────────────────────────┐
│  LAYER 1 — INTENT (YAML)                                 │
│  Declarative · Versionable · No code                     │
│  spec/workflows/ · spec/schemas/                         │
├──────────────────────────────────────────────────────────┤
│  LAYER 2 — COMMUNICATION (Contracts)                     │
│  Typed · Multi-language · Source of truth                │
│  protos/zynax/v1/ · spec/asyncapi/                       │
│  Sync: gRPC     Async: NATS JetStream                    │
├──────────────────────────────────────────────────────────┤
│  LAYER 3 — EXECUTION (Engines + Adapters)                │
│  Pluggable · Swappable · Never a hard dependency         │
│  services/engine-adapter/ · adapters                     │
└──────────────────────────────────────────────────────────┘
```

The separation is enforced, not aspirational: layer violations are hard CI
failures. Layer 1 YAML is never imported by Go services, Layer 2 contracts hold
no business logic, and Layer 3 engines always sit behind the `WorkflowEngine`
interface.

## The request path

```text
     YAML manifest (intent)
              ↓
       API Gateway (Go)        ← REST, bearer auth
              ↓
     Workflow Compiler (Go)    ← YAML → canonical IR
              ↓
      Engine Adapter (Go)      ← IR → Temporal / Argo
              ↓
        Task Broker (Go)       ← capability routing
              ↓
    Execution adapters         ← LLM / HTTP / Git / CI / LangGraph / ADK
              ↓
     Event Bus — NATS (Go)     ← lifecycle events
              ↓
      Memory Service (Go)      ← KV + vector context
```

| Service | Responsibility |
| --- | --- |
| api-gateway | REST entry point (`POST /api/v1/apply`, workflow reads), bearer auth, REST → gRPC translation |
| workflow-compiler | YAML → `WorkflowIR`; structural and semantic validation |
| engine-adapter | Executes the IR on Temporal or Argo; publishes lifecycle CloudEvents |
| task-broker | Resolves a capability to a provider and dispatches the call |
| agent-registry | The catalogue of registered capability providers |
| event-bus | NATS JetStream publish/subscribe for async events |
| memory-service | Key-value and vector context store for agents |

Cross-service communication is gRPC only — no shared packages and no shared
databases.

## The workflow IR

Engines speak different languages: Temporal wants activities and workflows,
Argo wants Kubernetes YAML DAGs. Without a canonical representation, every engine
would need its own workflow format. The compiler therefore lowers YAML into an
engine-agnostic protobuf IR:

```text
YAML (user intent)
      ↓
  Workflow Compiler
      ↓
  Canonical IR          ← engine-agnostic protobuf
      ↓
  Engine Adapter        ← IR → engine-native format
      ↓
Temporal / Argo
```

```protobuf
message WorkflowIR {
    string workflow_id   = 1;
    string version       = 2;
    string target_engine = 3;
    bytes  ir_payload    = 4;  // legacy; prefer the structured fields below

    string           initial_state = 5;
    repeated StateIR states        = 6;
}

message StateIR {
    string                name            = 1;
    StateType             type            = 2;  // ACTIVE | TERMINAL | WAITING
    repeated ActionIR     actions         = 3;
    repeated TransitionIR transitions     = 4;
    int32                 timeout_seconds = 5;
}

message TransitionIR {
    string on_event   = 1;
    string guard      = 2;  // CEL expression
    string goto_state = 3;
}
```

## Engine adapters

Every engine implements one small Go interface. That interface is why engine
portability is a property of the system rather than a marketing claim:

```go
type WorkflowEngine interface {
    Submit(ctx context.Context, ir WorkflowIR, input map[string]any) (ExecutionID, error)
    Signal(ctx context.Context, id ExecutionID, event WorkflowEvent) error
    GetWorkflowStatus(ctx context.Context, id ExecutionID) (*ExecutionState, error)
    Cancel(ctx context.Context, id ExecutionID, reason string) error
    Watch(ctx context.Context, id ExecutionID) (<-chan ExecutionEvent, error)
    Name() string
}
```

| Engine | Status | Notes |
| --- | --- | --- |
| Temporal | Implemented | The default engine. An IR interpreter workflow drives the state machine and dispatches capabilities as activities. |
| Argo | Implemented | The portability proof — the same IR, executed by Argo Workflows on the same cluster. |
| LangGraph | Planned | Behind the same interface. |

Adding an engine is roughly 500 lines against this interface, not a rewrite.
Changing the interface shape requires an ADR.

## Capabilities and dispatch

Workflows route to capabilities, never to named agents:

```text
Named routing (tight):      task → agent:analyst-01
Capability routing (loose): task → capability:summarize
```

Resolution at run time:

1. The engine reaches a state with `capability: summarize`.
2. The task-broker asks the agent-registry for providers of `summarize`.
3. A routing policy picks one (round-robin with heartbeat liveness).
4. The broker dispatches `ExecuteCapability` over gRPC to the chosen provider.
5. Lifecycle events are published as CloudEvents on the event bus.

Any system becomes a capability provider by implementing the `AgentService` gRPC
contract — no SDK required:

| Existing system | Adapter | Capability |
| --- | --- | --- |
| OpenAI / Bedrock / Ollama | llm-adapter (Go) | `chat_completion` |
| GitHub API | git-adapter (Go) | `open_pr`, `request_review`, `get_diff` |
| GitHub Actions | ci-adapter (Go) | `trigger_workflow`, `get_run_status` |
| Any HTTP API | http-adapter (Go) | any name |
| LangGraph app | langgraph-adapter (Python) | graph node names |
| Google ADK agents | adk-adapter (Go) | ADK agent capabilities |

## State machines, not DAGs

| Property | DAG | State machine |
| --- | --- | --- |
| Loops | Requires workarounds | Native |
| Human-in-the-loop | Breaks the graph | A waiting state |
| Long-running (days) | Timeout problems | Event-driven |
| Async events | Complex | First-class transitions |
| Error recovery | Manual | A transition |

A code-review workflow naturally loops — `review → fix → review → merge` — which
no DAG expresses cleanly.

## Inside a service

Every Go service follows the same hexagonal layout, checked by a CI gate:

```text
services/<service>/
  internal/
    api/              ← gRPC handlers; delegate to domain
    domain/           ← business logic; zero gRPC/proto imports
    infrastructure/   ← databases, gRPC clients, engine SDKs
  cmd/<service>/      ← main.go wiring
```

The Temporal SDK, for example, appears only under `infrastructure/`. The domain
package that interprets the IR depends on two interfaces and nothing else — this
is what keeps the engines swappable.

## Language roles

Go owns the platform (Layers 1–3): state, routing, scheduling, contract
validation. Python owns much of the execution layer, because that is where the
AI/ML ecosystem lives. Any language can participate in the execution layer —
`AgentService` is a language-neutral gRPC contract, and generated stubs come from
`buf`.

## Further reading

- [`ARCHITECTURE.md`](https://github.com/zynax-io/zynax/blob/main/ARCHITECTURE.md) — the full design document
- [`ROADMAP.md`](https://github.com/zynax-io/zynax/blob/main/ROADMAP.md) — milestones and sequence
- [Architecture Decision Records](https://github.com/zynax-io/zynax/tree/main/docs/adr) — every one-way door, with rationale
