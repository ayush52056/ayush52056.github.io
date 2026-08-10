---
layout: post
title: "AGENTS.md vs SKILL.md: Where Should Your Agent Instructions Go?"
date: "2026-08-10 11:55:00 +0530"
categories: [ai, development]
tags: [agents, agents-md, agent-skills]
excerpt: "Learn when agent guidance belongs in AGENTS.md and when it should become a reusable SKILL.md workflow."
---

Imagine your coding agent edits a generated file even though your instructions
say never to touch it. The rule exists, but it lives inside a release skill that
the agent did not load for this task.

The problem is not the wording. The instruction is in the wrong place.

`AGENTS.md` and `SKILL.md` are both Markdown files that guide AI agents, but they
solve different problems. Put every workflow in `AGENTS.md` and important rules
get buried. Put an essential rule only in a skill and the agent may never see it.

Here is the short answer:

> **`AGENTS.md` is the project handbook. `SKILL.md` is an on-demand playbook.**

One naming detail before we continue: the open repository instruction format is
`AGENTS.md`, plural. Some tools use files such as `CLAUDE.md`, `GEMINI.md`, or
`*.agent.md`, but those are tool-specific formats with their own behavior.

![An AI agent using AGENTS.md as a project handbook and selecting SKILL.md as an on-demand playbook]({{ '/assets/agents-md-vs-skill-md.jpg' | relative_url }})
{: .article-figure }

## Put standing project rules in AGENTS.md

`AGENTS.md` gives a coding agent standing information about a repository. The
[official AGENTS.md site](https://agents.md/) describes it as a README for
agents.

Use it for information that should shape most work in the project:

```md
# Project guidance

- Add tests when you introduce new behavior.
- Run the test suite before finishing a code change.
- Never commit passwords, API keys, or `.env` files.
- Do not modify files in `generated/` by hand.
```

Good topics include setup commands, project structure, coding conventions,
testing expectations, security boundaries, and pull request rules.

These instructions guide the agent, but they do not enforce policy. If changing
`generated/` would be dangerous, protect it with permissions, tests, or CI as
well. Prose is useful context, not a security boundary.

The format is plain Markdown with no required headings or frontmatter. Large
repositories can also place additional `AGENTS.md` files in subdirectories so
different parts of the codebase receive more specific guidance. Exact loading
and precedence rules vary between agent tools, so check the documentation for
the tool you use.

## Put repeatable jobs in SKILL.md

A skill teaches an agent how to complete a specific, repeatable task. A skill
is actually a directory. `SKILL.md` is its required instruction file, and the
directory can also contain `scripts/`, `references/`, and `assets/`.

For example:

```md
---
name: write-release-notes
description: Draft release notes from merged pull requests. Use when preparing a release or changelog.
---

1. Collect pull requests merged since the previous tag.
2. Group user-visible changes by Added, Changed, and Fixed.
3. Exclude internal refactors unless they affect users.
4. Verify every issue and pull request link.
5. Produce Markdown using `assets/release-template.md`.
```

Compatible agents usually see the skill's name and description first. They load
the complete instructions when the task matches or when the user invokes the
skill. The [Agent Skills specification](https://agentskills.io/specification)
calls this progressive disclosure: detailed context is loaded only when it is
needed. An [Anthropic video](https://www.youtube.com/watch?v=fOxC44g8vig)
offers a concrete example: always using TypeScript strict mode belongs in the
project instructions, while a pull request review checklist belongs in a skill.

## Use one decision question

| Question | `AGENTS.md` | `SKILL.md` |
|---|---|---|
| Main purpose | Explain how to work in this project | Explain how to perform one kind of task |
| Best content | Commands, conventions, architecture, boundaries | Steps, decisions, scripts, references, assets |
| Scope | A repository or directory | A reusable capability |
| Format | Plain Markdown | YAML frontmatter plus instructions |
| When it loads | As standing project context | When selected or invoked |

The table is useful, but one question handles most real decisions:

> **Should the agent know this before almost every task in this project?**

If yes, use `AGENTS.md`. If it describes an occasional job with clear inputs,
steps, and an output, create a skill.

This matches advice from practitioners such as [Addy
Osmani](https://www.linkedin.com/posts/addyosmani_ai-programming-softwareengineering-activity-7458040442337619968-8H7P)
and [Peter
Szel](https://www.linkedin.com/posts/peterszel_your-team-is-probably-mixing-up-agent-skills-activity-7429837418104791041-i1fC):
keep hard-to-guess project rules in `AGENTS.md` and use skills for structured
workflows.

## The deeper issue is context and routing

Skills save context because their full instructions load only when needed. The
tradeoff is routing: automatic activation is not guaranteed. In a focused
Next.js evaluation, [Vercel
found](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals)
that a skill was not invoked in 56 percent of the default test cases. A compact
documentation index in `AGENTS.md` performed better in that experiment.

That does not prove that `AGENTS.md` is always better. It reveals a design
tradeoff. Standing instructions cost context every time they load. Skills save
context, but the agent must find the right one. Critical knowledge should not
depend only on that decision.

Keep essential rules and short routing hints in `AGENTS.md`. Put the deeper
procedure and supporting resources in a skill. This gives the agent a small map
up front and the full playbook only when needed.

Start with a concise `AGENTS.md`. Add a skill when the same multi-step job keeps
returning. Do not copy the full procedure into both files. Keep the rule or
pointer in `AGENTS.md` and let the skill own the detailed steps.

The distinction is simple: **repository rules describe the environment. Skills
describe how to do a particular job. Put the map where the agent will see it,
and load the playbook when the job begins.**

If you want to build one next, read [How to Write Agent Skills That Actually Work]({% post_url 2026-08-05-agent-skill-authoring-best-practices %}).
