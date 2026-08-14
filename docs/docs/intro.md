---
id: intro
title: Introduction
slug: /
sidebar_label: Introduction
sidebar_position: 1
description: Zynax is the engine-portability layer for agentic automation — write an agent workflow once and run it on Temporal or Argo without a rewrite.
---

# Zynax

**Write your agent workflow once — run it on Temporal or Argo without a rewrite.**

Zynax is the **engine-portability layer for agentic automation**: a declarative,
cloud-native, engine-agnostic control plane for AI agent workflows. You define a
workflow once as a YAML manifest, and run it on whichever execution engine your
organisation already operates.

Zynax is written in Go, runs on Kubernetes, is built on CNCF-graduated
technologies, and is released under **Apache-2.0**. The source lives at
[github.com/zynax-io/zynax](https://github.com/zynax-io/zynax).

## The wedge: engine portability

A workflow engine is an implementation detail your platform should not leak.
Most agent platforms bolt themselves to one runtime — and a Kubernetes-locked
agent platform cannot move a single workflow across engines.

Zynax makes the engine a **swappable plug-in**. The same manifest runs on
Temporal or on Argo; engine selection flows through the cluster, never through
the workflow file:

```bash
zynax up                 # the platform on kind, Temporal engine (default)
zynax up --engine argo   # the same platform, the same workflows, on Argo
```

That is the whole pitch, and it is the first thing the
[getting started guide](./getting-started.md) proves on your laptop.

## The control-plane analogy

Kubernetes did not build a new container runtime. It built a control plane that
abstracts container runtimes behind a declarative API. Zynax does the same for
AI agent workflows:

| Kubernetes concept | Zynax equivalent |
| --- | --- |
| Container | Capability |
| Pod spec | `AgentDef` YAML |
| Deployment | `Workflow` YAML |
| kubelet | Engine adapter |
| kube-scheduler | Task broker |

Zynax does **not** build workflow engines. It builds the control plane that
orchestrates them.

## Key principles

**Declarative-first.** Workflows are YAML manifests, not code — versionable,
diffable, GitOps-ready.

**Engine-agnostic.** Temporal and Argo are plug-ins behind a single
`WorkflowEngine` interface. Swap the engine without changing the workflow.

**Capability routing.** Workflows route to capabilities (`summarize`,
`run_tests`, `open_pr`), never to named agents. Swap the executor without
changing the workflow.

**No SDK required.** Any system becomes a capability by implementing the
`AgentService` gRPC contract — HTTP APIs, LLMs, Git providers, CI systems. A
Python SDK exists, but it is optional.

**Event-driven state machines, not DAGs.** Loops, human-in-the-loop pauses,
long-running runs, and async events are first-class rather than workarounds.

## What a workflow looks like

```yaml
# code-review.yaml
kind: Workflow
apiVersion: zynax.io/v1

metadata:
  name: code-review
  namespace: engineering

spec:
  initial_state: review

  states:
    review:
      actions:
        - capability: request_review
      on:
        - event: review.approved
          goto: merge
        - event: review.needswork
          goto: fix

    fix:
      on:
        - event: push
          goto: review

    merge:
      actions:
        - capability: merge_pr
      on:
        - event: merge.success
          goto: done

    done:
      type: terminal
```

```bash
zynax apply code-review.yaml
# run_id: wf-236c478f00eb68ce

zynax status workflow wf-236c478f00eb68ce
# WORKFLOW_STATUS_RUNNING

zynax logs wf-236c478f00eb68ce
# state.entered  review
# state.exited   review → merge
```

## Already standardised on something else?

Keep it. Agents and services you already run register with Zynax as
capabilities, so Zynax orchestrates across your engines and tools rather than
replacing them.

## Where to go next

- **[Getting started](./getting-started.md)** — boot a local cluster, run your
  first workflow with zero secrets and no model, then switch engines.
- **[Workflow manifests](./workflows.md)** — the anatomy of a `Workflow`: states,
  actions, events, guards, and data flow.
- **[Architecture](./architecture.md)** — the control plane, the workflow IR, and
  the engine adapters.
- **[CLI reference](./cli.md)** — every `zynax` verb and its real flags.

:::note
Zynax is built with CNCF-graduated technologies (Temporal, gRPC, OpenTelemetry).
It is not an official CNCF project.
:::
