---
id: cli
title: CLI reference
sidebar_label: CLI reference
sidebar_position: 5
description: Every zynax CLI verb — up, apply, status, logs, result, validate, events, down — with its real flags.
---

# CLI reference

`zynax` is a single Go binary. It talks to the api-gateway over HTTP REST for
everything that concerns a workflow run, and drives the cluster bring-up scripts
for `up` and `down`.

The authoritative surface is always `zynax --help` and `zynax <command> --help`.

## Install

Download a release binary from the
[latest GitHub Release](https://github.com/zynax-io/zynax/releases/latest) — for
example on Linux amd64:

```bash
curl -fsSL https://github.com/zynax-io/zynax/releases/latest/download/zynax_linux_amd64.tar.gz \
  | tar xz && sudo mv zynax /usr/local/bin/
zynax --version
```

From a checkout, `make install-cli` builds and installs to `~/bin/zynax`.

## Global flags

These are available on every subcommand:

| Flag | Environment variable | Default | Purpose |
| --- | --- | --- | --- |
| `--api-url` | `ZYNAX_API_URL` | `http://localhost:8080` | api-gateway base URL |
| `--api-key` | `ZYNAX_API_KEY` | — | Gateway bearer token, sent as the `Authorization` header |
| `--insecure` | — | `false` | Skip TLS certificate verification |

Export the two environment variables once and the commands below need no flags.

## Command summary

| Command | Purpose | Key flags |
| --- | --- | --- |
| `zynax up` | Create or reuse a local kind cluster and deploy the platform | `--profile`, `--engine`, `--no-load-images`, `--cluster-name`, `--namespace`, `--repo-root` |
| `zynax down` | Delete the local kind cluster | `--cluster-name`, `--repo-root` |
| `zynax doctor` | Read-only health checklist for the local platform | — |
| `zynax validate <file>` | Schema and data-flow checks, no gateway needed | `--schema-dir`, `--format` |
| `zynax init workflow\|expert [name]` | Scaffold a manifest from a template | `-o/--output`, `--template-dir` |
| `zynax apply <file>` | Submit a manifest to the gateway | `--dry-run`, `--engine`, `--crd` |
| `zynax status workflow <run-id>` | Print run status; exit 0 if terminal, 2 if running | — |
| `zynax logs [run-id]` | Stream lifecycle events | `-f/--follow`, `--format` |
| `zynax result [run-id]` | Print the run's declared result | — |
| `zynax get workflow <run-id>` | Full run snapshot | — |
| `zynax delete workflow <run-id>` | Cancel a running workflow | — |
| `zynax events publish <run-id> <event-type>` | Inject an event into a running workflow | `--data` (repeatable) |
| `zynax gitops watch <dir>` | Watch a directory and re-apply changed YAML | — |

## Cluster lifecycle

### `zynax up`

Brings the full platform up on a local kind cluster: creates the cluster,
side-loads images, installs the Helm umbrella, and waits for every Deployment to
roll out.

```bash
zynax up                       # lite profile, Temporal engine
zynax up --profile full        # 3-node, prod-mirroring topology
zynax up --engine argo         # the same platform on Argo
zynax up --no-load-images      # pull images from the registry instead
zynax up --repo-root ~/src/zynax
```

| Flag | Default | Meaning |
| --- | --- | --- |
| `--profile` | `lite` | `lite` (1-node, lean) or `full` (3-node, prod-mirroring) |
| `--engine` | `temporal` | `temporal` or `argo` |
| `--no-load-images` | `false` | Do not side-load local images into the cluster |
| `--cluster-name` | script default (`zynax-e2e`) | kind cluster name |
| `--namespace` | script default (`zynax`) | Namespace for the Zynax release |
| `--repo-root` | walk up from cwd | Path to the Zynax checkout (`ZYNAX_REPO_ROOT`) |

### `zynax down`

Deletes the kind cluster created by `zynax up`. Accepts `--cluster-name` and
`--repo-root`.

```bash
zynax down
```

### `zynax doctor`

A read-only checklist that answers "is my platform ready?" without hand-running
`kubectl`, `helm`, and `curl`. It checks the current kubecontext, the Helm
release, pod readiness, the gateway's `/healthz`, and whether the default
reference model is available locally. It exits non-zero unless the cluster,
release, pods, and gateway are all healthy; a missing local model is a warning,
not a failure.

```bash
zynax doctor
```

## Authoring

### `zynax init`

Scaffolds a manifest from a reusable template — `zynax init workflow [name]` for
a `Workflow`, `zynax init expert [name]` for an expert `AgentDef`.

```bash
zynax init workflow my-flow -o my-flow.yaml
zynax init expert reviewer --template-dir spec/templates
```

| Flag | Default | Meaning |
| --- | --- | --- |
| `-o`, `--output` | stdout | Write the scaffolded manifest to this path |
| `--template-dir` | `spec/templates` | Where templates are read from |

### `zynax validate`

Local schema and data-flow validation. It never contacts the gateway, so it is
the right thing to run in a pre-commit hook or a pull-request check.

```bash
zynax validate spec/workflows/examples/hello-world.yaml
zynax validate my-flow.yaml --format json
```

| Flag | Default | Meaning |
| --- | --- | --- |
| `--schema-dir` | `spec/schemas` | JSON Schema directory |
| `--format` | `text` | `text` or `json` |

## Running workflows

### `zynax apply`

Submits a manifest — `Workflow` or `AgentDef` — to the gateway and prints the
resulting run id. It also records that run id locally, so a later bare
`zynax logs` or `zynax result` targets it.

```bash
zynax apply spec/workflows/examples/hello-world.yaml
# run_id: wf-<hex>

zynax apply my-flow.yaml --dry-run     # validate without submitting
zynax apply my-flow.yaml --engine argo # engine hint forwarded on submit
zynax apply my-flow.yaml --crd         # apply as a Kubernetes custom resource
```

| Flag | Default | Meaning |
| --- | --- | --- |
| `--dry-run` | `false` | Validate the manifest without submitting it |
| `--engine` | — | Engine hint forwarded to the submit call |
| `--crd` | `false` | Apply a `Workflow` as a custom resource on the current Kubernetes context instead of via REST |

`zynax workflow run` and `zynax workflow publish` are aliases for `apply`, as are
`zynax publish` and `zynax agent publish`.

### `zynax status workflow`

```bash
zynax status workflow wf-<hex>
# WORKFLOW_STATUS_COMPLETED
```

Exits `0` when the run has reached a terminal status (`COMPLETED`, `FAILED`, or
`CANCELLED`) and `2` while it is still running — so it scripts cleanly in a
wait loop.

### `zynax logs`

Streams lifecycle events (state transitions and capability events) from the
gateway's SSE endpoint. With no run id it targets your most recent run.

```bash
zynax logs                    # the run you last applied
zynax logs wf-<hex>
zynax logs --follow           # tail until the run reaches a terminal state
zynax logs --format json
```

| Flag | Default | Meaning |
| --- | --- | --- |
| `-f`, `--follow` | `false` | Tail live and exit at the terminal state |
| `--format` | `text` | `text` or `json` |

### `zynax result`

Prints the run's declared result — the `outputs` block on the terminal state. Like
`logs`, it defaults to your most recent run.

```bash
zynax result
zynax result wf-<hex>
# message=Hello from Zynax
```

### `zynax get` and `zynax delete`

```bash
zynax get workflow wf-<hex>       # full run snapshot
zynax delete workflow wf-<hex>    # cancel a running workflow
```

### `zynax events publish`

Injects an event into a running workflow — the way to drive event-driven
workflows that wait on external systems. `--data` is repeatable.

```bash
zynax events publish wf-<hex> review.approved --data reviewer=alice
```

## GitOps

`zynax gitops watch <dir>` watches a directory for YAML changes and re-applies
the manifests as they change.

```bash
zynax gitops watch ./workflows
```

## A typical session

```bash
zynax up
kubectl -n zynax port-forward svc/zynax-api-gateway 18080:8080 &
export ZYNAX_API_URL=http://localhost:18080
export ZYNAX_API_KEY=$(kubectl -n zynax get secret zynax-gw-api-key -o jsonpath='{.data.api-key}' | base64 -d)

zynax doctor
zynax validate spec/workflows/examples/hello-world.yaml
zynax apply    spec/workflows/examples/hello-world.yaml
zynax logs --follow
zynax result
zynax down
```
