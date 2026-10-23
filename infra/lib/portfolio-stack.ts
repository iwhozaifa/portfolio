import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

export interface PortfolioStackProps extends StackProps {
  /** GitHub repository allowed to deploy, as owner/name. */
  githubRepo: string;
  /** Apex domain, for example alihuzaifa.dev. Without it the site is served on the CloudFront domain. */
  domainName?: string;
  /** Route 53 hosted zone for domainName; looked up by name when only the domain is given. */
  hostedZoneId?: string;
  /** Serve pull-request previews at pr-<n>.preview.<domainName>. Needs domainName. */
  previews?: boolean;
  /** An existing GitHub OIDC provider ARN in the account; one is created when omitted. */
  githubOidcProviderArn?: string;
  /** Monthly cost budget in USD, with alerts to budgetEmail. */
  monthlyBudgetUsd?: number;
  budgetEmail?: string;
}

// Security headers for every response. The CSP allows the site's own files plus the one call the
// bilty makes to the GitHub API; no inline script except Astro's hoisted modules, which are files.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://api.github.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

export class PortfolioStack extends Stack {
  constructor(scope: Construct, id: string, props: PortfolioStackProps) {
    super(scope, id, props);
    const { domainName, githubRepo } = props;
    const previews = Boolean(props.previews && domainName);

    const zone = domainName
      ? props.hostedZoneId
        ? route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', { hostedZoneId: props.hostedZoneId, zoneName: domainName })
        : route53.HostedZone.fromLookup(this, 'Zone', { domainName })
      : undefined;

    const certificate = zone && domainName
      ? new acm.Certificate(this, 'Certificate', {
          domainName,
          subjectAlternativeNames: [`www.${domainName}`, ...(previews ? [`*.preview.${domainName}`] : [])],
          validation: acm.CertificateValidation.fromDns(zone),
        })
      : undefined;

    const headers = new cloudfront.ResponseHeadersPolicy(this, 'Headers', {
      securityHeadersBehavior: {
        contentSecurityPolicy: { contentSecurityPolicy: CSP, override: true },
        strictTransportSecurity: { accessControlMaxAge: Duration.days(730), includeSubdomains: true, preload: true, override: true },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true },
      },
      customHeadersBehavior: {
        customHeaders: [{ header: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()', override: true }],
      },
    });

    // ---- production site ----
    const site = this.bucket('Site');
    const siteRouting = new cloudfront.Function(this, 'SiteRouting', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      comment: 'www to apex, and /path to /path/index.html',
      code: cloudfront.FunctionCode.fromInline(routing({ apex: domainName, previews: false })),
    });
    const siteCdn = this.distribution('SiteCdn', site, siteRouting, headers, {
      domainNames: domainName ? [domainName, `www.${domainName}`] : undefined,
      certificate,
    });
    if (zone && domainName) {
      for (const name of [domainName, `www.${domainName}`]) {
        const record = name === domainName ? undefined : 'www';
        new route53.ARecord(this, `A${record ?? 'Apex'}`, { zone, recordName: record, target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(siteCdn)) });
        new route53.AaaaRecord(this, `Aaaa${record ?? 'Apex'}`, { zone, recordName: record, target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(siteCdn)) });
      }
    }

    // ---- pull-request previews: one bucket, a prefix per PR, routed by host name ----
    let preview: { bucket: s3.Bucket; cdn: cloudfront.Distribution } | undefined;
    if (previews && zone && domainName && certificate) {
      const bucket = this.bucket('Preview');
      bucket.addLifecycleRule({ id: 'expire-old-previews', expiration: Duration.days(30) });
      const fn = new cloudfront.Function(this, 'PreviewRouting', {
        runtime: cloudfront.FunctionRuntime.JS_2_0,
        comment: 'pr-<n>.preview host to the pr-<n>/ prefix',
        code: cloudfront.FunctionCode.fromInline(routing({ apex: domainName, previews: true })),
      });
      const cdn = this.distribution('PreviewCdn', bucket, fn, headers, { domainNames: [`*.preview.${domainName}`], certificate });
      new route53.ARecord(this, 'APreview', { zone, recordName: '*.preview', target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cdn)) });
      preview = { bucket, cdn };
    }

    // ---- GitHub Actions deploy role, assumed through OIDC: no stored keys ----
    const provider = props.githubOidcProviderArn
      ? iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(this, 'GitHub', props.githubOidcProviderArn)
      : new iam.OpenIdConnectProvider(this, 'GitHub', { url: 'https://token.actions.githubusercontent.com', clientIds: ['sts.amazonaws.com'] });
    const deployRole = new iam.Role(this, 'DeployRole', {
      description: `GitHub Actions in ${githubRepo}: production environment only`,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${githubRepo}:environment:production`,
        },
      }),
    });
    this.grantPublish(deployRole, site, siteCdn);

    if (preview) {
      const previewRole = new iam.Role(this, 'PreviewRole', {
        description: `GitHub Actions in ${githubRepo}: pull-request previews only`,
        maxSessionDuration: Duration.hours(1),
        assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
          StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
          StringLike: { 'token.actions.githubusercontent.com:sub': `repo:${githubRepo}:pull_request` },
        }),
      });
      this.grantPublish(previewRole, preview.bucket, preview.cdn);
      new CfnOutput(this, 'PreviewBucketName', { value: preview.bucket.bucketName });
      new CfnOutput(this, 'PreviewDistributionId', { value: preview.cdn.distributionId });
      new CfnOutput(this, 'PreviewRoleArn', { value: previewRole.roleArn });
    }

    if (props.monthlyBudgetUsd && props.budgetEmail) {
      new budgets.CfnBudget(this, 'Budget', {
        budget: { budgetType: 'COST', timeUnit: 'MONTHLY', budgetLimit: { amount: props.monthlyBudgetUsd, unit: 'USD' } },
        notificationsWithSubscribers: [80, 100].map((threshold) => ({
          notification: { comparisonOperator: 'GREATER_THAN', notificationType: 'ACTUAL', threshold, thresholdType: 'PERCENTAGE' },
          subscribers: [{ subscriptionType: 'EMAIL', address: props.budgetEmail! }],
        })),
      });
    }

    new CfnOutput(this, 'SiteBucketName', { value: site.bucketName });
    new CfnOutput(this, 'SiteDistributionId', { value: siteCdn.distributionId });
    new CfnOutput(this, 'SiteUrl', { value: domainName ? `https://${domainName}` : `https://${siteCdn.distributionDomainName}` });
    new CfnOutput(this, 'DeployRoleArn', { value: deployRole.roleArn });
  }

  private bucket(id: string) {
    return new s3.Bucket(this, id, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }

  private distribution(
    id: string,
    bucket: s3.Bucket,
    fn: cloudfront.Function,
    headers: cloudfront.ResponseHeadersPolicy,
    extra: Pick<cloudfront.DistributionProps, 'domainNames' | 'certificate'>,
  ) {
    return new cloudfront.Distribution(this, id, {
      ...extra,
      defaultRootObject: 'index.html',
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      // A TLS policy applies only with a custom certificate; the default CloudFront domain uses its own.
      minimumProtocolVersion: extra.certificate ? cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021 : undefined,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        responseHeadersPolicy: headers,
        functionAssociations: [{ function: fn, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST }],
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 404, responsePagePath: '/404.html', ttl: Duration.minutes(5) },
        { httpStatus: 404, responseHttpStatus: 404, responsePagePath: '/404.html', ttl: Duration.minutes(5) },
      ],
    });
  }

  private grantPublish(role: iam.Role, bucket: s3.Bucket, cdn: cloudfront.Distribution) {
    bucket.grantReadWrite(role);
    bucket.grantDelete(role);
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['cloudfront:CreateInvalidation', 'cloudfront:GetInvalidation'],
      resources: [`arn:aws:cloudfront::${this.account}:distribution/${cdn.distributionId}`],
    }));
  }
}

/** The viewer-request function: www to apex, directory paths to index.html, preview hosts to prefixes. */
export function routing({ apex, previews }: { apex?: string; previews: boolean }) {
  return `function handler(event) {
  var request = event.request;
  var host = (request.headers.host && request.headers.host.value) || '';
  ${apex && !previews ? `if (host === 'www.${apex}') {
    return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: 'https://${apex}' + request.uri } } };
  }` : ''}
  var uri = request.uri;
  if (uri.endsWith('/')) uri += 'index.html';
  else if (!uri.split('/').pop().includes('.')) uri += '/index.html';
  ${previews ? `var m = host.match(/^(pr-[0-9]+)\\.preview\\./);
  if (!m) return { statusCode: 404, statusDescription: 'Not Found' };
  uri = '/' + m[1] + uri;` : ''}
  request.uri = uri;
  return request;
}`;
}
