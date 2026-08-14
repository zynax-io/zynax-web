---
id: getting-started
title: Getting started
sidebar_label: Getting started
sidebar_position: 2
description: Boot Zynax on a local kind cluster, run the zero-dependency hello-world workflow, then run the same workflow on a different engine.
---

# Getting started

This is the five-minute golden path: boot a local Kubernetes cluster that mirrors
production, run your first workflow with **no model and no secrets**, then run
that same workflow on a different engine.

## Prerequisites

- **Docker** Engine or Docker Desktop
- **[kind](https://kind.sigs.k8s.io/)**, **`kubectl`**, and **[Helm](https://helm.sh/)** on your `PATH`
- A host with roughly **4 CPU / 8 GB RAM**
- A checkout of [zynax-io/zynax](https://github.com/zynax-io/zynax) — `zynax up`
  drives the cluster bring-up scripts and Helm charts from the repository

No Go, Python, or `buf` toolchain is needed locally: images are built and loaded
inside containers.

```bash
git clone https://github.com/zynax-io/zynax.git
cd zynax
```

## Install the CLI

Download a release binary from the
[latest GitHub Release](https://github.com/zynax-io/zynax/releases/latest):

| Platform | Command |
| --- | --- |
| macOS (Apple Silicon) | `curl -fsSL https://github.com/zynax-io/zynax/releases/latest/download/zynax_darwin_arm64.tar.gz \| tar xz && sudo mv zynax /usr/local/bin/` |
| macOS (Intel) | `curl -fsSL https://github.com/zynax-io/zynax/releases/latest/download/zynax_darwin_amd64.tar.gz \| tar xz && sudo mv zynax /usr/local/bin/` |
| Linux (amd64) | `curl -fsSL https://github.com/zynax-io/zynax/releases/latest/download/zynax_linux_amd64.tar.gz \| tar xz && sudo mv zynax /usr/local/bin/` |
| Linux (arm64) | `curl -fsSL https://github.com/zynax-io/zynax/releases/latest/download/zynax_linux_arm64.tar.gz \| tar xz && sudo mv zynax /usr/local/bin/` |

From a checkout, `make install-cli` builds and installs the CLI to `~/bin/zynax`
instead. Verify either way:

```bash
zynax --version
```

## 1. Boot the platform

```bash
zynax up
```

`zynax up` creates a [kind](https://kind.sigs.k8s.io/) cluster, side-loads the
service images, installs the **production Helm charts**, and waits for every
Deployment to roll out. Nothing else is required for a first success — no Ollama,
no model, no API key.

The default profile is `lite` (single node, trimmed components) — the lean laptop
profile. Use the prod-mirroring topology CI runs with `--profile full`:

```bash
zynax up --profile full     # 3-node, prod-mirroring topology
zynax up --engine argo      # the same platform on the Argo engine
```

:::tip Prefer `make`?
`make demo` drives the same bring-up from the repository root and additionally
runs the hero workflow, ending in a **Platform ready** banner. Both entry points
wrap the same scripts — one runtime, two spellings.
:::

## 2. Reach the gateway

The api-gateway is auth-enabled. Reach it over a `kubectl port-forward` — the
reliable path. (The kind NodePort on `localhost:8080` also works, but resets
under load on repeat runs, so prefer the forward.)

Start the forward once, then export the URL and the cluster's bearer key so the
`zynax` commands below need no flags:

```bash
kubectl -n zynax port-forward svc/zynax-api-gateway 18080:8080 &
export ZYNAX_API_URL=http://localhost:18080
export ZYNAX_API_KEY=$(kubectl -n zynax get secret zynax-gw-api-key -o jsonpath='{.data.api-key}' | base64 -d)
```

## 3. Run your first workflow

`spec/workflows/examples/hello-world.yaml` is the smallest possible Zynax
workflow: one state dispatches the built-in `echo` capability, then the run goes
terminal. It needs no model and no secret.

```yaml
kind: Workflow
apiVersion: zynax.io/v1

metadata:
  name: hello-world
  namespace: demo

spec:
  initial_state: greet

  states:
    greet:
      actions:
        - capability: echo
          input:
            message: "Hello from Zynax"
          output:
            message: reply
      on:
        - event: echo.completed
          goto: done

    done:
      type: terminal
      outputs:
        message: "$.states.greet.output.message"
```

Validate it locally first (schema and data-flow checks, no gateway involved),
then submit it:

```bash
zynax validate spec/workflows/examples/hello-world.yaml
zynax apply spec/workflows/examples/hello-world.yaml
# run_id: wf-<hex>

zynax status workflow wf-<hex>
# WORKFLOW_STATUS_COMPLETED

zynax logs wf-<hex>      # the lifecycle events for the run
zynax result wf-<hex>    # message=Hello from Zynax
```

`WORKFLOW_STATUS_COMPLETED` is your first success: the engine dispatched the
in-cluster `echo` capability and ran to a terminal state with zero secrets.

:::note No need to shuttle the run id around
`zynax apply` records your most recent run locally, so a bare `zynax logs` or
`zynax result` (with no id) targets it. An explicit run id always overrides.
:::

## 4. Switch engines — the portability wedge

The same manifest runs unchanged on Temporal **or** Argo. Engine selection flows
through the cluster, never through the workflow file:

```bash
zynax up --engine argo
zynax apply spec/workflows/examples/hello-world.yaml
```

From the repository root, the `make` spelling of the same switch is:

```bash
ENGINE=argo make demo     # (or E2E_ENGINE=argo make demo)
```

The Argo leg is exercised on the prod-mirroring `full` profile — the topology CI
runs — so use `zynax up --profile full --engine argo` (or `PROFILE=full`) if the
lean profile comes up short.

This is the wedge: write once, run on whichever engine your organisation already
operates. Argo is runnable locally only because the runtime is Kubernetes.

## 5. Run a real model (optional)

To watch a real model review a git diff, make a model available to the
llm-adapter and apply the code-review example:

```bash
ollama pull qwen2.5-coder:3b     # default model for the llm-adapter

zynax apply spec/workflows/examples/code-review-ollama.yaml
zynax logs <run-id> --follow     # stream every state and step output
zynax result <run-id>            # print just the model's review text
```

Other examples under `spec/workflows/examples/` (such as `code-review.yaml`) are
reference specs that wait on external GitHub or review events. They are there to
teach data-flow patterns and do not run to completion from the CLI alone — drive
one forward with:

```bash
zynax events publish <run-id> review.approved --data reviewer=alice
```

## 6. Tear down

```bash
zynax down           # delete the local kind cluster
```

From a checkout, `make kind-down` does the same thing.

## Beyond kind

kind, k3s/k3d, and managed Kubernetes are the **same runtime model** at different
scale — the Helm umbrella installed by `zynax up` is the production chart. Point
`kubectl` at any cluster and `helm upgrade --install` the same umbrella.

## What next

- **[Workflow manifests](./workflows.md)** — author your own workflow.
- **[CLI reference](./cli.md)** — every verb and flag.
- **[Architecture](./architecture.md)** — what happened between `apply` and
  `COMPLETED`.
