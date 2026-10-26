---
name: git-rebase
description: Resolve Git merge, rebase and cherry-pick conflicts conservatively, preserving both sides' intent, staging only understood resolutions, and leaving a git-clean conflict state. Use when a merge, rebase or cherry-pick stops with conflicts, when the user asks to fix or resolve conflicts, or when git status shows unmerged paths.
---

# Git Conflict Resolution

Use this skill when a merge, rebase or cherry-pick stops with conflicts. The
goal is a clean merge result, not a clever shortcut.

## Core Rules

1. Understand every conflicted hunk before editing it.
2. Preserve important behavior from both sides whenever possible.
3. Prefer the smallest readable merge that keeps the code idiomatic for the
   affected language and project.
4. Do not delete tests, weaken assertions, suppress lint, swallow errors, or
   otherwise hide a failing invariant.
5. Do not commit, run `git rebase --continue`, `git merge --continue` or
   `git cherry-pick --continue`, unless the user asked you to.
6. Never run `--abort`, `reset --hard`, `checkout -- <file>` or force pushes on
   your own: they discard work. Suggest them to the user instead.
7. Do not leave conflict markers in any file.
8. If a conflict is unsafe or unclear, leave it unresolved and say why.

## Required Workflow

1. Identify the operation in progress with `git status`, and list the conflicted
   files with `git diff --name-only --diff-filter=U`.
2. For each hunk, identify what each side changed. During a rebase, "ours" is
   the branch being rebased onto and "theirs" is the commit being replayed; use
   `git log --merge -p <file>` or the commits on each side when the intent is
   unclear.
3. Edit the file so both sides' required behavior is represented.
4. Run only the formatting, lint or test commands that the project already
   defines and that are clearly relevant to the files you edited.
5. Stage resolved files with `git add`.
6. Check `git status --porcelain`; no unmerged entries may remain.
7. Report what was resolved, how, and any files that remain unsafe.

## Resolution Guidance

- Keep the error handling, context propagation and cancellation behavior that
  either side introduced.
- Preserve synchronization ownership; do not introduce unmanaged background
  work.
- Keep tests focused on behavior and invariants, not implementation details.
- When both sides add cases to a table or parameterized test, combine the cases
  unless they prove the same invariant twice.
- When both sides alter an interface or signature, update every implementation
  and caller instead of guessing from the conflicted file alone.
- For lock files and other generated files, do not hand-merge: regenerate them
  with the project's tool after resolving the source files, and say so.

## Fail-Honestly Criteria

Stop and leave the conflict unresolved when:

- you cannot tell which side owns the invariant,
- resolving would require deleting behavior from either side without evidence,
- conflict markers remain, or
- a binary/generated file conflict cannot be validated safely.

An honest unresolved conflict, with a clear report and the abort command the
user can run, is safer than a speculative broken merge.
