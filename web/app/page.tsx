import Link from "next/link";
import type { ReactNode } from "react";

/* --------------------------------------------------------------------------
 * Constants
 *
 * NOTE: `DOCS_HREF` points at the Docusaurus site, which CI merges into
 * `out/docs/` at deploy time. It is a *separate* application, so every link to
 * it must be a plain <a href="/docs/"> — never next/link, which would try a
 * client-side transition to a route the Next router does not know about.
 * `next/link` is reserved for real Next routes, i.e. `/`.
 * ------------------------------------------------------------------------ */

const DOCS_HREF = "/docs/";
const REPO_HREF = "https://github.com/zynax-io/zynax";
const RELEASES_HREF = `${REPO_HREF}/releases/latest`;
const ISSUES_HREF = `${REPO_HREF}/issues`;
const LICENSE_HREF = `${REPO_HREF}/blob/main/LICENSE`;
const SECURITY_HREF = `${REPO_HREF}/security/advisories/new`;
const ARCHITECTURE_HREF = `${REPO_HREF}/blob/main/ARCHITECTURE.md`;
const ROADMAP_HREF = `${REPO_HREF}/blob/main/ROADMAP.md`;
const CONTRIBUTING_HREF = `${REPO_HREF}/blob/main/CONTRIBUTING.md`;

/* --------------------------------------------------------------------------
 * Primitives
 * ------------------------------------------------------------------------ */

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <ZynaxMark className="h-6 w-6 shrink-0 text-accent" />
      <span className="text-[15px] font-semibold tracking-tight">Zynax</span>
    </span>
  );
}

/** One trunk forking into two branches — the engine-portability wedge. */
function ZynaxMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3.5 12h6l3.2-5.2h4" />
      <path d="M3.5 12h6l3.2 5.2h4" />
      <circle cx="19.2" cy="6.8" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="19.2" cy="17.2" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GitHubMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M2.5 8h11M9.5 4l4 4-4 4" />
    </svg>
  );
}

function CheckMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 8.5l3.2 3.2L13 4.8" />
    </svg>
  );
}

function CrossMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6" />
    </svg>
  );
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="border-t border-line"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        {children}
      </div>
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
      {children}
    </p>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  lede,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <header className="max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={`${id}-heading`}
        className="mt-3 text-pretty text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted sm:text-base">
          {lede}
        </p>
      ) : null}
    </header>
  );
}

function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent";
}) {
  const toneClass =
    tone === "accent"
      ? "border-accent/40 bg-accent/10 text-accent"
      : "border-line bg-background text-foreground";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-1 font-mono text-[11px] leading-none sm:text-xs ${toneClass}`}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------------------
 * Code rendering
 * ------------------------------------------------------------------------ */

function CodeCard({
  label,
  lang,
  children,
}: {
  label: string;
  lang: string;
  children: ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-surface">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="truncate font-mono text-[11px] text-muted">
          {label}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {lang}
        </span>
      </figcaption>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.65] sm:text-[13px]">
        <code>{children}</code>
      </pre>
    </figure>
  );
}

/** Renders one shell line: `$ ` prompt, binary, arguments, comments, output. */
function ShellLine({ line }: { line: string }) {
  if (line.length === 0) {
    return <span className="block">{" "}</span>;
  }
  if (line.trimStart().startsWith("#")) {
    return <span className="block text-muted">{line}</span>;
  }
  if (line.startsWith("$ ")) {
    const command = line.slice(2);
    const split = command.indexOf(" ");
    const binary = split === -1 ? command : command.slice(0, split);
    const args = split === -1 ? "" : command.slice(split);
    return (
      <span className="block">
        <span className="select-none text-muted">{"$ "}</span>
        <span className="font-medium text-accent">{binary}</span>
        <span>{args}</span>
      </span>
    );
  }
  // Everything else is command output.
  return <span className="block text-muted">{line}</span>;
}

function Shell({ source }: { source: string }) {
  return source
    .split("\n")
    .map((line, index) => <ShellLine key={index} line={line} />);
}

/** Renders one YAML line: comments muted, keys tinted, values plain. */
function YamlLine({ line }: { line: string }) {
  if (line.length === 0) {
    return <span className="block">{" "}</span>;
  }
  if (line.trimStart().startsWith("#")) {
    return <span className="block text-muted">{line}</span>;
  }
  const match = /^(\s*(?:-\s+)?)([A-Za-z0-9_.-]+)(:)(.*)$/.exec(line);
  if (!match) {
    return <span className="block">{line}</span>;
  }
  const [, indent, key, colon, rest] = match;
  return (
    <span className="block">
      <span>{indent}</span>
      <span className="text-accent">{key}</span>
      <span className="text-muted">{colon}</span>
      <span>{rest}</span>
    </span>
  );
}

function Yaml({ source }: { source: string }) {
  return source
    .split("\n")
    .map((line, index) => <YamlLine key={index} line={line} />);
}

/* --------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------ */

const HERO_SHELL = `# boot a local kind cluster: production Helm charts, no secrets
$ zynax up

$ zynax apply hello-world.yaml
run_id: wf-236c478f00eb68ce

$ zynax status workflow wf-236c478f00eb68ce
WORKFLOW_STATUS_COMPLETED

# same manifest, other engine, zero edits
$ zynax up --engine argo
$ zynax apply hello-world.yaml
WORKFLOW_STATUS_COMPLETED`;

const QUICKSTART_SHELL = `# 1 - bring the platform up on a local kind cluster
$ zynax up

# 2 - apply a workflow manifest
$ zynax apply spec/workflows/examples/hello-world.yaml
run_id: wf-236c478f00eb68ce

# 3 - inspect the run
$ zynax status workflow wf-236c478f00eb68ce
WORKFLOW_STATUS_COMPLETED

$ zynax logs wf-236c478f00eb68ce
state.entered  review
state.exited   review -> merge

# 4 - the wedge: same workflow, Argo instead of Temporal
$ zynax up --engine argo

# 5 - tear it all back down
$ zynax down`;

const WORKFLOW_YAML = `kind: Workflow
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
      type: terminal`;

const PIPELINE = [
  "workflow.yaml",
  "api-gateway",
  "workflow-compiler",
  "engine-adapter",
];

const PRINCIPLES = [
  {
    title: "Declarative-first",
    body: "Workflows are YAML manifests, not code. Versionable, diffable, GitOps-ready.",
  },
  {
    title: "Engine-agnostic",
    body: "Temporal, Argo and LangGraph are plugins. Swap the engine without changing the workflow.",
  },
  {
    title: "Capability routing",
    body: "Workflows route to capabilities — summarize, run_tests, open_mr — not to named agents. Swap the executor without changing the workflow.",
  },
  {
    title: "No SDK required",
    body: "Any system becomes a capability by implementing the AgentService gRPC contract: HTTP APIs, LLMs, Git providers, CI systems.",
  },
  {
    title: "Event-driven state machines",
    body: "Not DAGs. Loops, human-in-the-loop, long-running workflows and async events are native.",
  },
  {
    title: "Cloud-native by construction",
    body: "Go services on Kubernetes, gRPC between them, NATS JetStream for events. Built on CNCF-graduated technologies.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Declare the workflow once",
    body: "One YAML manifest describes an event-driven state machine: states, the capabilities each state invokes, and the events that move it forward. No engine SDK appears anywhere in it.",
  },
  {
    step: "02",
    title: "The control plane compiles it",
    body: "zynax apply posts the manifest to the api-gateway. workflow-compiler validates it and lowers it to a canonical WorkflowIR — a protobuf representation that no longer mentions YAML or any engine.",
  },
  {
    step: "03",
    title: "Any engine executes it",
    body: "engine-adapter submits that same IR to Temporal or to Argo, and task-broker dispatches each capability to a registered adapter over gRPC. Changing the engine is a flag, not a rewrite.",
  },
];

const WITHOUT_ZYNAX = [
  "A Kubernetes-locked agent platform cannot move one workflow across engines.",
  "Workflow logic is written against one runtime, so a migration is a rewrite.",
  "Workflows address agents by name, so replacing an executor edits every workflow.",
  "Adding a new tool means adopting yet another vendor SDK.",
];

const WITH_ZYNAX = [
  "One manifest runs unchanged on Temporal or on Argo — that portability is the wedge.",
  "The engine is a flag: zynax up --engine argo, and the workflow file is untouched.",
  "Workflows route to capabilities, so the executor behind one can be replaced freely.",
  "Any gRPC service is a capability. Already standardized on a K8s-native agent tool? It registers as one.",
];

/* --------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------ */

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main" className="flex-1">
        <Hero />
        <Problem />
        <HowItWorks />
        <Principles />
        <Quickstart />
      </main>

      <SiteFooter />
    </>
  );
}

/* --------------------------------------------------------------------------
 * Header
 * ------------------------------------------------------------------------ */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        {/* A real Next route, so next/link is correct here. */}
        <Link
          href="/"
          className="flex items-center rounded-md"
          aria-label="Zynax home"
        >
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <a
            href="#problem"
            className="hidden rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-foreground md:inline-flex"
          >
            Why
          </a>
          <a
            href="#how-it-works"
            className="hidden rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-foreground md:inline-flex"
          >
            How it works
          </a>
          <a
            href="#quickstart"
            className="hidden rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-foreground md:inline-flex"
          >
            Quickstart
          </a>

          {/* Docusaurus is a separate app: plain anchor, never next/link. */}
          <a
            href={DOCS_HREF}
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
          >
            Docs
          </a>

          <a
            href={REPO_HREF}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-foreground sm:px-3"
          >
            <GitHubMark className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

/* --------------------------------------------------------------------------
 * Hero
 * ------------------------------------------------------------------------ */

function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_28rem_at_50%_-8rem,color-mix(in_oklab,var(--accent)_14%,transparent),transparent)]"
      />
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Pill tone="accent">Apache-2.0</Pill>
              <Pill>Go + Kubernetes</Pill>
              <Pill>CNCF-graduated tech</Pill>
            </div>

            <h1
              id="hero-heading"
              className="mt-6 text-balance text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.9rem]"
            >
              Write your agent workflow once.
              <span className="mt-2 block text-muted">
                Run it on Temporal or Argo, without a rewrite.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-[17px]">
              Zynax is the engine-portability layer for agentic automation: a
              declarative, cloud-native control plane that compiles one YAML
              manifest into a canonical IR and submits it to whichever workflow
              engine your organisation already operates.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* Docusaurus is a separate app: plain anchor, never next/link. */}
              <a
                href={DOCS_HREF}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
              >
                Read the docs
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={REPO_HREF}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-background px-5 text-sm font-medium transition-colors hover:border-accent/50"
              >
                <GitHubMark className="h-4 w-4" />
                zynax-io/zynax
              </a>
            </div>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
              Local development runs on{" "}
              <span className="font-mono text-[13px] text-foreground">kind</span>
              , the same Kubernetes runtime used in CI and production. The first
              successful run needs no API key, no model and no secrets.
            </p>
          </div>

          <div className="min-w-0">
            <CodeCard label="engine portability, on your laptop" lang="shell">
              <Shell source={HERO_SHELL} />
            </CodeCard>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
 * Problem
 * ------------------------------------------------------------------------ */

function Problem() {
  return (
    <Section id="problem">
      <SectionHeading
        id="problem"
        eyebrow="The problem"
        title="Agent platforms pick your execution engine for you."
        lede="Most agent frameworks bind the workflow to the runtime that ships with them. The orchestration semantics, the retry model and the addressing scheme all leak into your workflow definition — so the day your organisation standardises on a different engine, the workflows do not move with you."
      />

      <div className="mt-10 grid gap-4 sm:mt-12 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-xl border border-line bg-surface p-6">
          <h3 className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line text-muted">
              <CrossMark className="h-3.5 w-3.5" />
            </span>
            Locked to one engine
          </h3>
          <ul className="mt-5 space-y-3.5">
            {WITHOUT_ZYNAX.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-muted"
              >
                <CrossMark className="mt-1 h-3.5 w-3.5 shrink-0 text-muted" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-accent/35 bg-accent/[0.04] p-6">
          <h3 className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-accent/40 text-accent">
              <CheckMark className="h-3.5 w-3.5" />
            </span>
            Portable across engines
          </h3>
          <ul className="mt-5 space-y-3.5">
            {WITH_ZYNAX.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-foreground"
              >
                <CheckMark className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------------------
 * How it works
 * ------------------------------------------------------------------------ */

function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeading
        id="how-it-works"
        eyebrow="How it works"
        title="Declarative spec, control plane, then the engine you already run."
        lede="Like Kubernetes for containers, Zynax is a control plane that abstracts the execution layer behind a declarative, versionable API. The manifest never names an engine, so the engine is free to change."
      />

      <div className="mt-10 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <ol
          className="flex flex-wrap items-center gap-x-2.5 gap-y-3"
          aria-label="Zynax request pipeline"
        >
          {PIPELINE.map((node) => (
            <li key={node} className="flex items-center gap-2.5">
              <Pill>{node}</Pill>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
            </li>
          ))}
          <li className="inline-flex items-center gap-2 rounded-lg border border-dashed border-accent/45 px-2 py-1.5">
            <Pill tone="accent">Temporal</Pill>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              or
            </span>
            <Pill tone="accent">Argo</Pill>
          </li>
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          The fork at the end is the whole product. Everything to its left is
          engine-neutral.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <ol className="space-y-8">
          {HOW_IT_WORKS.map((item) => (
            <li key={item.step} className="flex gap-4 sm:gap-5">
              <span className="mt-0.5 shrink-0 font-mono text-xs text-accent">
                {item.step}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
          <li className="flex gap-4 sm:gap-5">
            <span className="mt-0.5 shrink-0 font-mono text-xs text-muted">
              {"→"}
            </span>
            <p className="min-w-0 text-sm leading-relaxed text-muted">
              The full service topology — gateway, compiler, engine adapter,
              task broker, agent registry, event bus and memory service — is
              documented in{" "}
              <a
                href={ARCHITECTURE_HREF}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-accent underline decoration-accent/35 underline-offset-4 hover:decoration-accent"
              >
                ARCHITECTURE.md
              </a>
              .
            </p>
          </li>
        </ol>

        <div className="min-w-0">
          <CodeCard label="code-review.yaml" lang="yaml">
            <Yaml source={WORKFLOW_YAML} />
          </CodeCard>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            An event-driven state machine, not a DAG — which is what makes
            loops, human-in-the-loop steps and long-running waits expressible.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------------------
 * Principles
 * ------------------------------------------------------------------------ */

function Principles() {
  return (
    <Section id="principles">
      <SectionHeading
        id="principles"
        eyebrow="Principles"
        title="Design commitments, not roadmap items."
      />

      <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {PRINCIPLES.map((principle) => (
          <article key={principle.title} className="bg-background p-6">
            <h3 className="text-sm font-semibold tracking-tight">
              {principle.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              {principle.body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------------------
 * Quickstart
 * ------------------------------------------------------------------------ */

function Quickstart() {
  return (
    <Section id="quickstart">
      <SectionHeading
        id="quickstart"
        eyebrow="Quickstart"
        title="Five commands, one local cluster, two engines."
        lede="zynax up creates a kind cluster, loads the images, installs the production Helm charts and waits for every deployment to roll out. No Ollama, no model and no API key are needed for the first successful run."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        <div className="min-w-0">
          <CodeCard label="the five-minute golden path" lang="shell">
            <Shell source={QUICKSTART_SHELL} />
          </CodeCard>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight">Prerequisites</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li className="flex gap-3">
              <CheckMark className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="min-w-0">
                Docker, kind, kubectl and Helm on the host
              </span>
            </li>
            <li className="flex gap-3">
              <CheckMark className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="min-w-0">
                Roughly 4 CPU and 8 GB RAM available
              </span>
            </li>
            <li className="flex gap-3">
              <CheckMark className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="min-w-0">
                No cloud account, no model provider, no secrets
              </span>
            </li>
          </ul>

          <h3 className="mt-8 text-sm font-semibold tracking-tight">
            Install the CLI
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Prebuilt <span className="font-mono text-[13px]">zynax</span>{" "}
            binaries for macOS and Linux, on both amd64 and arm64, ship with
            every{" "}
            <a
              href={RELEASES_HREF}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent underline decoration-accent/35 underline-offset-4 hover:decoration-accent"
            >
              GitHub release
            </a>
            .
          </p>

          <div className="mt-8 rounded-xl border border-line bg-surface p-5">
            <p className="text-sm leading-relaxed text-muted">
              Everything past the golden path — the model-backed code-review
              demo, scaling onto managed Kubernetes, and observability — lives
              in the documentation.
            </p>
            {/* Docusaurus is a separate app: plain anchor, never next/link. */}
            <a
              href={DOCS_HREF}
              className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent"
            >
              Open the documentation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------------------
 * Footer
 * ------------------------------------------------------------------------ */

const FOOTER_COLUMNS: {
  heading: string;
  links: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    heading: "Documentation",
    links: [
      { label: "Docs home", href: DOCS_HREF },
      { label: "Quickstart", href: "#quickstart" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Architecture", href: ARCHITECTURE_HREF, external: true },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "Source on GitHub", href: REPO_HREF, external: true },
      { label: "Releases", href: RELEASES_HREF, external: true },
      { label: "Roadmap", href: ROADMAP_HREF, external: true },
      { label: "Issues", href: ISSUES_HREF, external: true },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Contributing", href: CONTRIBUTING_HREF, external: true },
      { label: "Report a vulnerability", href: SECURITY_HREF, external: true },
      { label: "License (Apache-2.0)", href: LICENSE_HREF, external: true },
    ],
  },
];

function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              The engine-portability layer for agentic automation. Declarative,
              cloud-native and engine-agnostic.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Pill>Apache-2.0</Pill>
              <Pill>Go</Pill>
              <Pill>Kubernetes</Pill>
              <Pill>gRPC</Pill>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  {column.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        className="text-sm text-muted transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-muted">
            Zynax is built with CNCF-graduated technologies (Temporal, gRPC,
            OpenTelemetry). It is not an official CNCF project.
          </p>
          <p className="shrink-0 font-mono text-xs text-muted">
            Apache-2.0 {"·"} zynax.io
          </p>
        </div>
      </div>
    </footer>
  );
}
