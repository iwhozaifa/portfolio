# Git workflow

Trunk-based: `main` is always deployable, and every merge to `main` deploys to production
(after the `production` environment approval, from milestone 6). Pull requests get a preview deploy.

## Branches

| Branch | Purpose | Protected |
| --- | --- | --- |
| `main` | Production. Every commit on it is a squash-merged PR. | yes |
| `feat/<scope>-<short-desc>` | New capability (a section, a component, a case study) | — |
| `fix/<scope>-<short-desc>` | Bug fix | — |
| `chore/<short-desc>` · `docs/<short-desc>` · `ci/<short-desc>` · `infra/<short-desc>` | Tooling, docs, pipeline, AWS | — |

```
feat/* ──PR + green ci + preview──squash──▶ main ──▶ deploy (production approval)
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `type(scope): subject`.

- Types: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `perf`, `ci`, `build`, `style`.
- Scopes: `tokens`, `hero`, `bilty`, `work`, `case`, `ship`, `about`, `contact`, `footer`, `nav`, `motion`,
  `imagery`, `seo`, `infra`, `ci`.
- The subject is imperative, lower-case and ≤ 72 characters, with no trailing period.

## Pull requests

1. Every branch has a GitHub issue; the PR body says `Closes #n`. Milestones from `docs/PLAN.md` are issues.
2. Open with `gh pr create --base main` and fill in the template. The PR title is a Conventional Commit,
   because it becomes the squash commit.
3. One concern per PR, ideally under 500 changed lines excluding lockfiles and images.
4. The `ci` check must be green and the branch up to date with `main`.
5. Ali Huzaifa (@iwhozaifa) confirms before anything is merged.
6. The next branch starts from an up-to-date `main` after the previous PR is merged.

## Merge strategy

- Squash merge only. Merge commits and rebase merges are disabled.
- The squash commit takes the PR title and body.
- Head branches are deleted automatically after merge.
- Linear history on `main`; no force pushes, no deletions.

## Repository settings (applied)

```bash
gh repo edit iwhozaifa/portfolio \
  --enable-squash-merge --enable-merge-commit=false --enable-rebase-merge=false \
  --delete-branch-on-merge --enable-auto-merge --allow-update-branch
gh api -X PATCH repos/iwhozaifa/portfolio \
  -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=PR_BODY
```

## Branch protection

Applied once the `ci` check has run at least once (on the bootstrap PR): see the command in the
bootstrap PR description, and re-run it if checks are added (Playwright, Lighthouse, inspect, cdk).

## Local guard

`npm install` runs `prepare`, which points git at `.githooks/`. Its `pre-push` hook refuses direct
pushes to `main` before they leave the machine, a second line of defence behind GitHub branch protection.
