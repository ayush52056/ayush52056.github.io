---
layout: post
title: "How to Write Agent Skills That Actually Work"
date: 2026-08-05 16:30:00 +0530
categories: [ai, open-source]
tags: [agents, skills, evaluation, security]
excerpt: "A complete, practical guide to understanding, designing, writing, testing, and maintaining reliable Agent Skills."
---

An AI agent can already write, reason, search, and use tools. But general ability
does not guarantee that it will follow *your* process, remember specialized
knowledge, or handle a fragile workflow consistently. That is the gap an Agent
Skill is designed to fill.

An Agent Skill is a small, self-contained package that teaches an agent how to
handle a specific kind of task. It combines a precise description of when it
should be used with an operational workflow and, when useful, supporting scripts,
references, or reusable assets.

I built the guide behind this article to turn those ideas into a process that
people can inspect, test, and improve instead of relying on trial and error.

![A modular Agent Skill connecting workflow, references, scripts, and validation]({{ '/assets/agent-skill-system.webp' | relative_url }})
{: .article-figure }

Creating the folder is easy. The real work is making sure the skill appears for
the right requests, stays out of unrelated tasks, and improves the result. It
also needs to use context carefully and remain safe around real tools and data.
This guide explains how to get those parts right.

<nav class="article-toc" aria-labelledby="article-toc-title">
  <p id="article-toc-title">In this guide</p>
  <ol>
    <li><a href="#what-is-an-agent-skill">What an Agent Skill is</a></li>
    <li><a href="#when-should-you-create-a-skill">When to create one</a></li>
    <li><a href="#the-anatomy-of-a-skill">The anatomy of a skill</a></li>
    <li><a href="#how-to-write-a-skill-step-by-step">How to write one</a></li>
    <li><a href="#how-to-test-an-agent-skill">How to test it</a></li>
    <li><a href="#security-and-maintenance">Security and maintenance</a></li>
  </ol>
</nav>

## What is an Agent Skill?

Think of a skill as an **on-demand operating manual for an agent**. The agent
does not need every instruction for every task. Instead, it sees a short name
and description, decides whether the skill matches the current request, and
loads the full workflow only when needed.

That gives skills three important properties:

- **Conditional:** they are loaded for relevant tasks rather than placed in
  every prompt.
- **Operational:** they tell the agent how to act, decide, verify, and recover.
  They are not merely background reading.
- **Packaged:** the instructions can travel with scripts, references, templates,
  examples, or other resources needed to complete the work.

For example, a test-diagnosis skill can teach an agent to reproduce the narrowest
failure, isolate the first causal error, distinguish an environment problem from
a code defect, and verify the smallest correction. A document skill might define
how to use a house template, apply an editorial style, render the result, and
inspect every page before reporting completion.

### Why use skills instead of a longer prompt?

A prompt handles one conversation. A skill captures a reusable capability. It
is useful when the same workflow must work across tasks, people, or projects.

Skills also support **progressive disclosure**, which simply means showing
detail only when it becomes useful. The agent first sees a short name and
description. It loads the core instructions after choosing the skill, then reads
larger references only when the task reaches the relevant branch. This keeps
unrelated detail out of the way.

Most importantly, a well-designed skill makes quality measurable. Its trigger
behavior, workflow, safety boundaries, and completion evidence can all be tested.

## When should you create a skill?

Create a skill when at least one of these conditions is true:

- Agents repeatedly fail at a recognizable task.
- A workflow has non-obvious ordering, branching, or recovery steps.
- The work depends on organization-, product-, or domain-specific knowledge.
- Deterministic scripts, references, or output templates should travel with the
  workflow.
- The guidance is useful only for certain requests and should not occupy every
  prompt.

Do not create a skill simply to collect generic advice, establish a persona, or
repeat knowledge the model already applies reliably. A skill is also the wrong
place for a rule that must *always* be enforced mechanically.

<div class="decision-grid" role="group" aria-label="Choosing the right agent extension">
  <div><strong>Always-relevant convention</strong><span>Repository instructions</span></div>
  <div><strong>Conditional workflow</strong><span>Agent Skill</span></div>
  <div><strong>Current remote data or action</strong><span>Tool or MCP server</span></div>
  <div><strong>Repeated exact transformation</strong><span>Script</span></div>
  <div><strong>Rule that cannot be optional</strong><span>Test, policy, or hook</span></div>
  <div><strong>Large independent task</strong><span>Subagent or separate task</span></div>
</div>

Ask one simple question: **what observable problem will this skill correct?** If
you cannot name a failure, missing capability, or reusable operation, collect a
few real examples before writing instructions.

## The anatomy of a skill

The portable baseline is deliberately small:

```text
my-skill/
├── SKILL.md        # routing metadata and core workflow
├── scripts/        # optional deterministic operations
├── references/     # optional detail loaded when needed
└── assets/         # optional templates and output resources
```

Keep this portable core separate from settings that work only in one agent
platform. The open format also supports optional `license`, `compatibility`,
`metadata`, and experimental `allowed-tools` fields. Interface labels, model
settings, and tool bindings should follow the platform's own documentation.

### `SKILL.md`: the required core

`SKILL.md` begins with YAML front matter containing a `name` and `description`,
followed by the instructions the agent should apply after the skill is selected.

```yaml
---
name: diagnose-test-failures
description: Diagnose failing or flaky automated tests by reproducing the
  failure, isolating the first causal error, and verifying the smallest
  corrective change. Use when tests fail locally or in CI, a user asks why a
  suite is failing, or intermittent test behavior needs root-cause analysis.
---
```

The name is an identifier. The description is much more important: it is the
skill's routing interface. It must communicate both **what the skill does** and
**when it should run**.

The body is the working agreement. It explains what goes in, what should come
out, which steps to follow, how to make important decisions, how to check the
result, and what to do when something fails.

### Scripts, references, and assets

- Put an operation in `scripts/` when it is repeated, fragile, or mechanically
  verifiable. A script should validate inputs, fail with useful errors, avoid
  hidden side effects, and be tested by execution. It should also run without
  interaction, use documented exit codes, support a dry run for risky work, and
  limit or redirect unusually large output.
- Put large schemas, domain documentation, extended examples, and uncommon
  workflow branches in `references/`. Every reference should be linked directly
  from `SKILL.md` with a clear instruction describing *when* to read it.
- Put output templates, boilerplate, images, fonts, and reusable starter files
  in `assets/`. They are materials for producing the result, not instructions
  that must always enter the model's context.

<div class="skill-layers" aria-label="Progressive disclosure in an Agent Skill">
  <div><span>1</span><strong>Name + description</strong><small>Always visible for routing</small></div>
  <div><span>2</span><strong>Core workflow</strong><small>Loaded after activation</small></div>
  <div><span>3</span><strong>Resources</strong><small>Loaded only for the relevant branch</small></div>
</div>

This layered structure is not merely tidier. It prevents a large skill from
crowding out the user's request, repository context, and tool results.

## How to write a skill, step by step

### 1. Start with observed behavior

Before writing instructions, collect evidence from completed work. Useful
sources include successful runs, user corrections, review comments, tool traces,
issue history, previous fixes, and repeated explanations. Then record concrete
examples:

1. Prompts that should activate the skill.
2. Nearby prompts that should not activate it.
3. A representative task the agent currently mishandles.
4. The visible failure, such as a skipped check, unsafe action, wrong order, or
   missing domain fact.
5. The evidence that would prove the result has improved.

Starting from behavior keeps the skill focused on an actual capability gap.

### 2. Define the behavioral contract

Write down the contract before the detailed workflow:

| Part | Question to answer |
|---|---|
| Inputs | What information or artifacts are required to begin? |
| Outputs | What files, decisions, reports, or state will be produced? |
| Invariants | What must remain true throughout the task? |
| Workflow | Which steps and branches lead to the result? |
| Validation | What observable evidence proves completion? |
| Failure behavior | What happens when an input, permission, tool, or check is missing? |
| Boundaries | Which adjacent tasks does this skill intentionally not own? |

For a test-diagnosis skill, an invariant might be “do not weaken a check or
change unrelated code.” Completion might require the original failing command
to pass, or a diagnosis supported by an error trace when a fix is out of scope.

### 3. Write a precise trigger description

A weak description such as “helps with testing and code quality” creates two
problems: relevant prompts may not match it, and unrelated prompts may activate
it. A strong description starts with the distinctive action, names the artifact
or outcome, and includes realistic situations users describe.

Use these rules:

- Put the most distinctive action and trigger terms near the beginning.
- Use language that users actually say.
- Keep one coherent intent per skill.
- Include adjacent cases only when the same workflow handles them.
- Avoid promotional claims such as “expert” or “best-in-class.”
- Compare the description with neighboring skills so their boundaries are clear.
- Keep host-specific invocation syntax out of the portable description.

Invocation is simply how the skill starts. Automatic selection is convenient
for routine, low-risk work. A direct user request is safer for destructive,
expensive, privileged, security-sensitive, or production-impacting actions. A
skill may support both paths, but they should lead to the same workflow.

### 4. Write an executable workflow, not an essay

Use imperative instructions that tell the agent what to inspect, how to choose a
branch, what proves each stage is complete, and what to do when evidence is
missing.

Weak instruction:

> Carefully inspect the implementation and follow best practices.

Stronger instruction:

> Inspect the changed public interfaces, run the narrowest affected tests, and
> report every unresolved failure with its command and first causal error.

The stronger version is observable. It defines an action, scope, validation,
and reporting requirement without hardcoding one repository's commands.

Give the agent one preferred path. Add a branch only when it materially changes
the work. Too many equal options force the model to rediscover the workflow on
every invocation.

### 5. Decide how strict the skill should be

Not every task needs the same rigidity.

- **High freedom:** heuristics and goals for research, writing, or design tasks
  with many valid solutions.
- **Medium freedom:** ordered steps, decision tables, pseudocode, and
  parameterized commands.
- **Low freedom:** fixed gates, validated scripts, narrow parameters, previews,
  and explicit approvals.

Use less freedom as consequences increase. Deployments, migrations, credentials,
security, compliance, destructive changes, and irreversible external actions
need tight scopes and explicit stop conditions.

### 6. Keep the core concise

Treat context like a shared budget. Keep `SKILL.md` focused on the workflow the
agent usually needs. Move variant-specific or long-form material into references
and avoid chains where one reference merely points to another.

“Read the references folder” is not useful routing. Prefer a conditional
instruction such as: “Read `references/api-errors.md` only after an API request
returns a non-success status.”

During testing, observe which resources are actually loaded. Move repeatedly
needed guidance into the core. Improve routing for resources that are skipped.
Delete resources that never contribute.

### 7. Define “done” with evidence

A tool returning successfully does not prove the task succeeded. Depending on
the work, completion evidence may include:

- exact test or check outcomes
- an inspected diff
- schema or syntax validation
- a rendered and visually inspected artifact
- a dry run before an external mutation
- verification of final state after the mutation
- an explicit list of checks that could not be performed.

Never let the skill turn “attempted” into “complete.” When validation cannot
run, the agent should report the limitation and keep the result unverified.

## A compact skill example

This simplified example shows the shape of a useful core file:

```markdown
---
name: diagnose-test-failures
description: Diagnose failing or flaky automated tests by reproducing the
  failure, isolating the first causal error, and verifying the smallest
  correction. Use when tests fail locally or in CI.
---

# Diagnose test failures

## Inputs
- A failing command, test name, CI run, or error report.

## Workflow
1. Read project instructions and identify the narrowest reproducing command.
2. Run it without modifying code. Preserve the exit status and first causal error.
3. Classify the failure as environment, dependency, product code, test code,
   or intermittent behavior.
4. Reduce the scope or add temporary observation when the cause is unclear.
5. Explain the root cause using evidence from the responsible code path.
6. If a fix was requested, make the smallest complete correction.
7. Re-run the original reproduction and the narrowest surrounding tests.

## Validation
- Require the original failure to pass after a fix.
- Do not count a skipped, weakened, or removed test as a repair.
- Report commands, outcomes, changed files, and remaining uncertainty.

## Safety
- Preserve unrelated changes.
- Never weaken a check merely to produce a passing result.
```

Notice what is absent: a persona, a long explanation of software testing, rigid
commands that may not exist in the project, and an unsupported promise of
success. The file gives the agent a focused procedure while leaving room to
adapt to the repository.

## How to test an Agent Skill

Skill evaluation asks two different questions:

1. **Did the right skill load for the right request?**
2. **Once loaded, did it improve the task enough to justify its context and risk?**

### Test routing separately

Build a trigger suite with three groups:

- **Positive prompts:** varied wording that should activate the skill.
- **Negative prompts:** nearby tasks that should not activate it.
- **Boundary prompts:** incomplete or ambiguous requests where the expected
  choice must be documented.

Near misses matter more than obviously irrelevant prompts. A test-diagnosis
skill should be compared with prompts about writing new tests, reviewing general
code quality, or optimizing CI speed. Do not use prompts about cooking dinner.

Test the skill alone, beside its closest competitors, and inside the realistic
catalog. A description that routes perfectly in isolation may collide with
other installed skills.

Two useful routing measures are:

- **Recall:** relevant prompts that activated the skill ÷ all relevant prompts.
- **Precision:** correct activations ÷ all skill activations.

Improving one can damage the other. Adding more generic trigger words may catch
additional positive prompts while also causing unwanted activations.

### Compare execution with a baseline

Run representative tasks without the skill first. Save the prompt, output,
changes, checks, tool usage, and time. Then run the same class of tasks with the
skill and compare outcomes.

Cover the normal path and the uncomfortable paths: missing inputs, invalid data,
unavailable permissions, failed validation, a branch requiring judgment, a
safety boundary, and partial progress. Also verify that every consequential
constraint and approval gate was actually exercised. A correct final file can
hide a skipped safety step.

Keep some evaluation cases held out while authoring. If every test directly
shapes the instructions, the skill may memorize the suite instead of improving
the underlying task.

You do not need a huge test suite to begin. Start with roughly 8 to 10 prompts
that should select the skill and another 8 to 10 that should not. Set some aside
before editing the description, repeat each query, and finish with fresh prompts.
Keep separate results for each agent platform, model, and way of starting the
skill. Save the prompts, outputs, traces, scores, and timing so you can explain
why one version worked better.

## Security and maintenance

A skill may look like a document, but it should be reviewed like software when
it includes scripts or instructions for using tools.

Review instructions, references, scripts, dependencies, network destinations,
filesystem scope, requested permissions, and secret access. External webpages,
issues, documents, comments, and tool output must be treated as **data**, not as
authority that can expand permissions or override the user's request.

For skills you author:

- Request only the tools and permissions the workflow needs.
- Treat dynamic shell injection as code execution and never interpolate
  untrusted text into its commands.
- Do not assume `allowed-tools` creates a restrictive sandbox. Review its exact
  permission effect on the target host.
- Make network access and external mutations explicit.
- Validate paths, arguments, schemas, and untrusted content.
- Use previews or dry runs before consequential operations.
- Require approval at destructive or irreversible boundaries.
- Redact sensitive values from logs and outputs.
- Fail closed when validation or authorization is unavailable.
- Test malformed, malicious, and oversized inputs.

For third-party skills, inspect the entire package and its dependencies before
installation. Verify its origin and license, test scripts with non-sensitive
fixtures, and pin the exact version you reviewed. Popularity, a familiar author,
or a marketplace listing is not a security review.

Skills also age. Model behavior, tools, hosts, dependencies, and organizational
policies change. Re-run routing and task evaluations after meaningful changes.
Remove obsolete guidance instead of piling new exceptions on top, and retire a
skill when it no longer produces a repeatable benefit.

## A practical quality checklist

Before sharing a skill, confirm that:

- [ ] It solves a documented, recurring problem.
- [ ] Its boundary is clear and one coherent workflow owns the matching prompts.
- [ ] Its description names the action, outcome, and realistic trigger contexts.
- [ ] Positive, negative, boundary, and competing-skill prompts have been tested.
- [ ] The workflow uses clear actions, decisions, checkpoints, and recovery paths.
- [ ] Supporting detail is loaded only when relevant.
- [ ] Scripts have explicit inputs, safe side effects, useful errors, and execution tests.
- [ ] Completion requires observable evidence.
- [ ] Permissions and external actions follow least privilege.
- [ ] The skill improves outcomes over a no-skill baseline.
- [ ] A maintainer, update path, and retirement rule are known.

Do not publish the skill if its executable code is unreviewed, destructive work
lacks a scoped preview and approval boundary, changed state is not validated,
copied material has unknown provenance, or evaluation shows no meaningful
improvement.

## The principle behind all of this

A good skill does not try to make the agent sound more capable. It makes the
agent's behavior more dependable.

That is the standard I wanted for this project. Every recommendation should
lead to behavior that someone can observe, test, and maintain.

Start with an observed problem. Define the contract. Route precisely. Write the
smallest workflow that handles the real branches. Load supporting context only
when needed. Require evidence before completion. Test against a baseline and
the actual skill catalog. Then keep reviewing the skill as the surrounding
system changes.

For the complete authoring standard, scored quality rubric, trigger evaluation
template, task evaluation method, security guidance, portable template, and
worked example, see the open-source
[Agent Skill Authoring Best Practices repository](https://github.com/ayush52056/agent-skill-authoring-best-practices).
