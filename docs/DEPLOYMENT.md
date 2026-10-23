# Deploying to AWS

The site is static: S3 (private, read through CloudFront origin access control) behind CloudFront, with
Route 53 and an ACM certificate once there is a domain. Everything is in `infra/` (AWS CDK) and is tested
offline in CI (`infra/test/stack.test.ts`). GitHub Actions deploys through OIDC: no AWS keys are stored.

```
push to main ─► ci (build, contrast, taste lint, infra typecheck + tests + synth)
             └► deploy (environment: production, approved by Ali Huzaifa)
                  build → S3 sync (_astro/* immutable, the rest no-cache) → CloudFront invalidation
                  → smoke test (pages + security headers) → bilty.json "Delivered"
pull request ─► preview (pr-<n>.preview.<domain>, removed when the PR closes)
infra/** PR  ─► infra diff posted on the PR; on main, cdk deploy after approval
```

The deploy, preview and infra workflows do nothing until the repository variables below exist.

## One-time setup

1. **Account and CLI.** An AWS account, the AWS CLI v2 and admin credentials on your machine for this
   first deploy only. Use one region: the stack is pinned to `us-east-1` (CloudFront certificates live
   there).
2. **Bootstrap CDK** once per account: `cd infra && npm ci && npx cdk bootstrap aws://<account>/us-east-1`.
3. **Optional domain.** Register it (Route 53 or elsewhere) and create a public hosted zone. Then export
   `DOMAIN_NAME=<domain>` and `HOSTED_ZONE_ID=<zone id>`, and `PREVIEWS=1` for pull-request previews.
   Without a domain the site is served on its `*.cloudfront.net` address and previews are off.
4. If the account already has GitHub's OIDC provider, export `GITHUB_OIDC_PROVIDER_ARN=<its arn>`.
   Export `BUDGET_EMAIL=<address>` for the $5 monthly budget alerts.
5. **Deploy the stack:** `npx cdk deploy`. Note the outputs.
6. **Repository variables** (Settings → Secrets and variables → Actions → Variables), from the outputs:

| Variable | From |
| --- | --- |
| `AWS_DEPLOY_ROLE_ARN` | `DeployRoleArn` |
| `SITE_BUCKET` | `SiteBucketName` |
| `SITE_DISTRIBUTION_ID` | `SiteDistributionId` |
| `SITE_URL` | `SiteUrl` |
| `DOMAIN_NAME`, `HOSTED_ZONE_ID`, `PREVIEWS`, `BUDGET_EMAIL` | the values used above |
| `AWS_PREVIEW_ROLE_ARN`, `PREVIEW_BUCKET`, `PREVIEW_DISTRIBUTION_ID` | the `Preview*` outputs, with previews |
| `AWS_INFRA_ROLE_ARN` | optional: a role trusted for this repo's OIDC tokens that may assume the CDK bootstrap roles (`cdk-*-deploy-role-*`), to let `infra.yml` diff and deploy |

7. The `production` environment requires Ali Huzaifa's approval for every deploy.

## Caching

Astro fingerprints everything in `/_astro/`, so those files are uploaded with
`public, max-age=31536000, immutable`. HTML, `bilty.json`, the sitemap and the fonts revalidate on every
visit (`max-age=0, must-revalidate`). One `/*` invalidation per deploy clears the edge for them.

## Rolling back

Revert the commit on `main` (through a pull request, like everything else). The deploy workflow ships the
previous version and its old `/_astro/` files are still in the bucket, because the sync never deletes
under `_astro/`.
