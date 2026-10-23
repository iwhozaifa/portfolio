// Offline assertions on the synthesized template: no AWS account needed, run in CI on every PR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { PortfolioStack, routing, type PortfolioStackProps } from '../lib/portfolio-stack.ts';

const synth = (props: Partial<PortfolioStackProps> = {}) => {
  const app = new App();
  const stack = new PortfolioStack(app, 'Test', {
    env: { account: '123456789012', region: 'us-east-1' },
    githubRepo: 'iwhozaifa/portfolio',
    ...props,
  });
  return Template.fromStack(stack);
};

test('the site bucket is private, encrypted and TLS-only', () => {
  const t = synth();
  t.hasResourceProperties('AWS::S3::Bucket', {
    PublicAccessBlockConfiguration: { BlockPublicAcls: true, BlockPublicPolicy: true, IgnorePublicAcls: true, RestrictPublicBuckets: true },
    BucketEncryption: { ServerSideEncryptionConfiguration: [{ ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }] },
  });
  t.hasResourceProperties('AWS::S3::BucketPolicy', {
    PolicyDocument: { Statement: Match.arrayWith([Match.objectLike({ Effect: 'Deny', Condition: { Bool: { 'aws:SecureTransport': 'false' } } })]) },
  });
});

test('CloudFront reads the bucket through origin access control, over HTTPS, with HTTP/3', () => {
  const t = synth();
  t.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1);
  t.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: Match.objectLike({
      HttpVersion: 'http2and3',
      DefaultRootObject: 'index.html',
      DefaultCacheBehavior: Match.objectLike({ ViewerProtocolPolicy: 'redirect-to-https', Compress: true }),
      CustomErrorResponses: Match.arrayWith([Match.objectLike({ ErrorCode: 404, ResponsePagePath: '/404.html' })]),
    }),
  });
});

test('every response carries the security headers', () => {
  synth().hasResourceProperties('AWS::CloudFront::ResponseHeadersPolicy', {
    ResponseHeadersPolicyConfig: Match.objectLike({
      SecurityHeadersConfig: Match.objectLike({
        StrictTransportSecurity: Match.objectLike({ AccessControlMaxAgeSec: 63072000, IncludeSubdomains: true, Preload: true }),
        ContentSecurityPolicy: Match.objectLike({ ContentSecurityPolicy: Match.stringLikeRegexp("frame-ancestors 'none'") }),
        ContentTypeOptions: Match.anyValue(),
        FrameOptions: { FrameOption: 'DENY', Override: true },
      }),
    }),
  });
});

test('the deploy role trusts only this repo\'s production environment, through OIDC', () => {
  synth().hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [Match.objectLike({
        Action: 'sts:AssumeRoleWithWebIdentity',
        Condition: { StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': 'repo:iwhozaifa/portfolio:environment:production',
        } },
      })],
    },
    MaxSessionDuration: 3600,
  });
});

test('the deploy role can invalidate only its own distribution', () => {
  const t = synth();
  const policies = t.findResources('AWS::IAM::Policy');
  const statements = Object.values(policies).flatMap((p: any) => p.Properties.PolicyDocument.Statement);
  const invalidate = statements.find((s: any) => ([] as string[]).concat(s.Action).includes('cloudfront:CreateInvalidation'));
  assert.ok(invalidate, 'an invalidation statement exists');
  assert.notEqual(invalidate.Resource, '*');
});

test('an existing GitHub OIDC provider is reused instead of created', () => {
  const t = synth({ githubOidcProviderArn: 'arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com' });
  t.resourceCountIs('Custom::AWSCDKOpenIdConnectProvider', 0);
});

test('with a domain: certificate, apex and www aliases; previews add a wildcard host', () => {
  const t = synth({ domainName: 'example.dev', hostedZoneId: 'Z123', previews: true });
  t.hasResourceProperties('AWS::CertificateManager::Certificate', {
    DomainName: 'example.dev',
    SubjectAlternativeNames: ['www.example.dev', '*.preview.example.dev'],
  });
  t.resourceCountIs('AWS::Route53::RecordSet', 5);
  t.resourceCountIs('AWS::CloudFront::Distribution', 2);
});

test('without a domain there are no previews, certificates or DNS records', () => {
  const t = synth({ previews: true });
  t.resourceCountIs('AWS::CertificateManager::Certificate', 0);
  t.resourceCountIs('AWS::Route53::RecordSet', 0);
  t.resourceCountIs('AWS::CloudFront::Distribution', 1);
});

test('the budget alerts at 80% and 100% when an email is given', () => {
  synth({ monthlyBudgetUsd: 5, budgetEmail: 'owner@example.com' }).hasResourceProperties('AWS::Budgets::Budget', {
    Budget: Match.objectLike({ BudgetLimit: { Amount: 5, Unit: 'USD' } }),
    NotificationsWithSubscribers: Match.arrayWith([Match.objectLike({ Notification: Match.objectLike({ Threshold: 100 }) })]),
  });
});

// The CloudFront Function's routing, run as plain JavaScript against sample requests.
const run = (code: string, host: string, uri: string) => {
  const handler = new Function(`${code}; return handler;`)();
  return handler({ request: { uri, headers: { host: { value: host } } } });
};

test('routing: directory paths get index.html, files stay, www redirects to the apex', () => {
  const code = routing({ apex: 'example.dev', previews: false });
  assert.equal(run(code, 'example.dev', '/').uri, '/index.html');
  assert.equal(run(code, 'example.dev', '/work/cloudattend').uri, '/work/cloudattend/index.html');
  assert.equal(run(code, 'example.dev', '/work/cloudattend/').uri, '/work/cloudattend/index.html');
  assert.equal(run(code, 'example.dev', '/_astro/app.1a2b.css').uri, '/_astro/app.1a2b.css');
  const www = run(code, 'www.example.dev', '/work');
  assert.equal(www.statusCode, 301);
  assert.equal(www.headers.location.value, 'https://example.dev/work');
});

test('routing: preview hosts map to their pull request\'s prefix, other hosts get 404', () => {
  const code = routing({ apex: 'example.dev', previews: true });
  assert.equal(run(code, 'pr-12.preview.example.dev', '/work/daa-study-hub').uri, '/pr-12/work/daa-study-hub/index.html');
  assert.equal(run(code, 'pr-12.preview.example.dev', '/_astro/a.js').uri, '/pr-12/_astro/a.js');
  assert.equal(run(code, 'evil.example.dev', '/').statusCode, 404);
});
