---
layout: post
title: "Vibe Coding Is Easy. But How Do You Know the Code Works?"
date: "2026-09-15 21:15:00 +0530"
categories: [ai, development]
tags: [vibe-coding, ai-coding, testing, code-review]
excerpt: "Learn a simple verification process for deciding whether AI-generated code is ready to trust, share, or release."
---

The most dangerous AI-generated code does not always crash. Sometimes it opens
the dashboard, looks finished, and quietly lets one user read another user's
data.

An AI coding agent can build a login form in minutes. A successful sign-in proves
that one path worked once. It says nothing about wrong passwords, cross-user
access, expired sessions, or sensitive data written to logs.

This is the real shift in AI-assisted development: generating code is becoming
cheap, but building confidence in that code still takes engineering work.
**Verification** means checking when the software works, when it fails, and
whether it behaves safely.

Vibe coding makes this step easy to skip. [Andrej Karpathy described a casual
loop](https://x.com/karpathy/status/1886192184808149383): prompt, run, and repeat
until the result looks right. That suits disposable prototypes. [Martin
Fowler](https://martinfowler.com/bliki/VibeCoding.html) warns against it when
correctness, security, or maintenance matters.

You do not need a huge testing system. Start with three clear gates between
generation and release.

<div class="skill-layers" role="img" aria-label="Three verification gates between an idea and trusted software: define success, run checks, and review risk">
  <div>
    <span>1</span>
    <strong>Define success</strong>
    <small>Write clear requirements before generating code.</small>
  </div>
  <div>
    <span>2</span>
    <strong>Run checks</strong>
    <small>Use tests, types, linting, and real user flows.</small>
  </div>
  <div>
    <span>3</span>
    <strong>Review risk</strong>
    <small>Inspect the goal, scope, security, and future upkeep.</small>
  </div>
</div>

## Turn the prompt into a testable contract

"Build a secure login system" is not enough. The word *secure* does not tell the
agent what it must prove.

Instead, write a few **acceptance criteria**. These are simple statements that
describe what the finished feature must do:

- A valid user can sign in.
- An invalid password does not reveal whether the email exists.
- A user cannot access another user's account.
- A session expires after the configured time.
- Logs never contain passwords or authentication tokens.

These statements create clear targets. They stop the agent from testing only the
easiest case and calling the job finished. They also protect against a subtle
problem: when the same vague prompt produces both the code and its tests, both
can agree on the same wrong behavior.

Your judgment still matters. In Anthropic's analysis of roughly 400,000 Claude
Code sessions, people made most planning decisions while Claude handled most
execution. The useful split is clear: [you define the goal and the agent helps
carry it out](https://www.anthropic.com/research/claude-code-expertise).

## Make the agent show its work

"Done" is a status message, not evidence. Ask the agent to show what it checked,
the exact commands it ran, and their results.

For most small projects, start with four kinds of proof:

1. **Behavior tests:** Check the expected result and important failure cases.
2. **Automatic checks:** Run the project's type checker and linter. These tools
   catch many mistakes without guessing what the code means.
3. **Security checks:** Scan dependencies and important boundaries when the app
   handles accounts, payments, or private information.
4. **A real user flow:** Use the feature in the browser or environment where it
   will actually run.

The commands depend on the project, but a useful report might look like this:

```text
Goal: Prevent users from reading another user's profile

Evidence:
- Authorization tests: 8 passed, including cross-user access
- Type check: passed
- Linter: passed
- Browser check: unauthorized request returned 403

Files changed: 3
Known limitation: administrator access was not tested
```

Run important commands yourself when possible. An agent can misunderstand a
result, leave out a failure, or make a test easier so its code can pass.

More tests do not guarantee correctness, but weak tests create false confidence.
[EvalPlus](https://github.com/evalplus/evalplus) checks generated code with much
larger test suites. Code that passes a small set can fail on more inputs and edge
cases.

## Review what green checks cannot see

Green checks are useful evidence, not proof. Tests cover the behavior someone
remembered to describe. They may miss an unnecessary dependency, a risky design
change, duplicated logic, exposed data, or five unrelated files modified along
the way.

Next, review the **diff**, which is the list of lines the agent added, removed,
or changed. Ask three questions:

- **Intent:** Does the change solve the original problem rather than a convenient
  interpretation of it?
- **Scope:** Did the agent change only the files and behavior it needed to change?
- **Risk:** Could the change harm security, privacy, speed, compatibility, or
  future maintenance?

An AI reviewer can help find suspicious code, but it should be an extra check,
not your only check. OpenAI's Codex guidance says that [tests, protected branches,
and required approvals still provide the firm safety
rules](https://learn.chatgpt.com/blog/custom-code-review-rules-for-codex).
The Codex repository applies the same principle in practice. Its
[`AGENTS.md`](https://github.com/openai/codex/blob/main/AGENTS.md) requires
integration tests for changes to agent logic and snapshot coverage for visible
interface changes.

For a stronger approach, write the tests before the code. Confirm that the tests
fail because the feature does not exist yet. Then ask the agent to make them pass
without changing the tests. [Cursor's agent
guide](https://cursor.com/blog/agent-best-practices) recommends this pattern
because it gives the agent a clear target without letting it move the finish
line.

## A release check you can reuse

Before sharing or deploying AI-generated code, ask:

1. Can I explain what changed and why?
2. Did I see the relevant checks run successfully?
3. Did we test failure cases, not only the happy path?
4. Did another person or a separate check review the result?
5. Can I safely undo the change if it fails?

If the answer to an important question is no, pause before releasing. That does
not mean the whole project is bad. It only means you have found the next thing to
check. A personal weekend tool needs fewer checks than a payment system because
the cost of failure is much lower.

Vibe coding shrinks the distance between an idea and a working prototype.
Verification turns that prototype into software people can depend on. Give the
agent clear instructions, but make the code earn your trust with evidence.

**AI can generate confidence in seconds. Your release process must generate
proof.**
