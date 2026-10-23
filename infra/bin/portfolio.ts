// The portfolio's AWS app. Configuration comes from the environment so CI and a laptop deploy the same
// stack: DOMAIN_NAME and HOSTED_ZONE_ID once a domain exists, PREVIEWS=1 for pull-request previews,
// GITHUB_OIDC_PROVIDER_ARN when the account already has GitHub's provider, BUDGET_EMAIL for cost alerts.
import { App } from 'aws-cdk-lib';
import { PortfolioStack } from '../lib/portfolio-stack.ts';

const env = process.env;
const app = new App();
new PortfolioStack(app, 'AliHuzaifaPortfolio', {
  // CloudFront certificates live in us-east-1, so the whole stack does.
  env: { account: env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  description: "Ali Huzaifa's portfolio: S3 + CloudFront + Route 53 + ACM, deployed by GitHub Actions over OIDC",
  githubRepo: env.GITHUB_REPO ?? 'iwhozaifa/portfolio',
  domainName: env.DOMAIN_NAME || undefined,
  hostedZoneId: env.HOSTED_ZONE_ID || undefined,
  previews: env.PREVIEWS === '1',
  githubOidcProviderArn: env.GITHUB_OIDC_PROVIDER_ARN || undefined,
  monthlyBudgetUsd: 5,
  budgetEmail: env.BUDGET_EMAIL || undefined,
  tags: { project: 'portfolio', owner: 'ali-huzaifa' },
});
