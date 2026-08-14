---
id: workflows
title: Workflow manifests
sidebar_label: Workflow manifests
sidebar_position: 3
description: The anatomy of a Zynax Workflow manifest — states, actions, capabilities, transitions, guards, and declared outputs.
---

# Workflow manifests

A Zynax workflow is a YAML manifest describing an **event-driven state machine**.
It is intent, not code: versionable, diffable, and GitOps-ready. Nothing in the
manifest names an engine or an agent, which is why the same file runs unchanged
on Temporal or Argo.

Manifests are validated against the JSON schemas in `spec/schemas/` — locally
with `zynax validate`, and in CI with `make validate-spec`.

## Top-level shape

```yaml
kind: Workflow
apiVersion: zynax.io/v1

metadata:
  name: code-review          # required, DNS-style name
  namespace: engineering     # optional, defaults to "default"
  version: 1.0.0             # optional SemVer of the manifest itself
  labels:                    # optional string map
    team: platform

spec:
  initial_state: review      # required, must name a key in states
  states:                    # required, at least one state
    review: {}
```

## States

`spec.states` is a map of state name to state definition. A state may declare:

| Field | Purpose |
| --- | --- |
| `type` | `normal` (default), `terminal`, or `human_in_the_loop` |
| `actions` | Ordered capability invocations run when the state is entered |
| `on` | Outbound transitions, evaluated in order |
| `outputs` | Workflow-level results — **terminal states only** |

Every workflow must be able to reach a terminal state; the compiler enforces
that, rejects orphan states, and rejects `on` transitions on terminal states.

```yaml
states:
  review:
    type: normal
    actions:
      - capability: request_review
    on:
      - event: review.approved
        goto: merge
      - event: review.needswork
        goto: fix

  waiting_for_human:
    type: human_in_the_loop
    on:
      - event: approval.granted
        goto: merge

  done:
    type: terminal
```

## Actions and capabilities

An action names a **capability**, never an agent:

```yaml
actions:
  - capability: echo
    timeout: 30m               # optional; e.g. 30s, 30m, 1h
    input:
      message: "Hello from Zynax"
    output:
      message: reply
```

- `capability` (required) must match a capability declared by a registered
  `AgentDef`.
- `timeout` bounds how long the platform waits for the agent to report
  completion.
- `input` is the payload template handed to the agent.
- `output` writes fields of the action result back into the workflow's data
  context, so later states can read them.

Capability routing is what decouples the workflow from its executor: replace the
agent behind `summarize` and no workflow file changes.

## Transitions, events, and guards

Transitions are edges keyed by CloudEvent type. The state machine evaluates them
in order and fires the first whose event matches and whose guard holds:

```yaml
on:
  - event: task.completed
    guard: 'result.score > 7'   # optional CEL expression
    goto: merge
    set:                        # optional context writes on transition
      approved: "true"
  - event: task.completed
    goto: fix
```

- `event` and `goto` are required.
- `guard` is a [CEL](https://github.com/google/cel-spec) expression evaluated by
  the engine. Guard evaluation is **fail-closed**: a guard that errors does not
  fire the transition.
- `set` writes key-value pairs into the workflow context when the transition
  fires.

Because transitions are events rather than graph edges, loops
(`review → fix → review`), human-in-the-loop pauses, and long-running waits are
native — not DAG workarounds.

## Triggers

A workflow can start itself from an incoming CloudEvent instead of a manual
`zynax apply`:

```yaml
spec:
  triggers:
    - event: github.pull_request.opened
      filter:
        repository: zynax-io/zynax
  initial_state: review
```

All `filter` entries must match for the trigger to fire. Omit `triggers`
entirely for manually submitted workflows.

## Declared outputs

A terminal state can declare what the run returns. Values are literals or data
references of the form `$.states.<state>.output.<key>`:

```yaml
  done:
    type: terminal
    outputs:
      message: "$.states.greet.output.message"
```

Whatever a terminal state declares is what `zynax result <run-id>` prints and
what the gateway serves on the run's outputs read path.

## Capabilities come from AgentDefs

A capability is provided by any service that implements the `AgentService` gRPC
contract and registers itself. The provider is described by a second manifest
kind, `AgentDef`, which declares each capability with a JSON-Schema input and
output contract:

```yaml
apiVersion: zynax.io/v1alpha1
kind: AgentDef

metadata:
  name: code-review-agent
  namespace: default

spec:
  capabilities:
    - name: summarize
      description: Produces a concise summary of a pull request diff.
      input_schema:
        type: object
        required: [text]
        properties:
          text:
            type: string
      output_schema:
        type: object
        required: [summary]
        properties:
          summary:
            type: string
      timeout_seconds: 30
      max_retries: 2
```

`AgentDef` manifests are applied with the same verb as workflows:
`zynax apply agent-def.yaml`.

## Authoring loop

```bash
zynax init workflow my-flow -o my-flow.yaml   # scaffold from a template
zynax validate my-flow.yaml                   # schema + data-flow checks, no gateway
zynax apply my-flow.yaml                      # submit
zynax logs --follow                           # tail the run you just submitted
zynax result                                  # print its declared outputs
```

Reference manifests live under
[`spec/workflows/examples/`](https://github.com/zynax-io/zynax/tree/main/spec/workflows/examples)
in the product repository.
