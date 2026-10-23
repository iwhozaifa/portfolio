// The bilty as the page shows it: data from scripts/bilty.mjs, words and dates ready to render.
import bilty from '../data/bilty.json';

export const statusWord: Record<string, string> = {
  local: 'Local build',
  'on-the-road': 'On the road',
  delivered: 'Delivered',
  held: 'Held at checkpost',
};

export const consignment = bilty.run ? `#${bilty.run}` : 'local';
export const status = statusWord[bilty.status] ?? bilty.status;
export const shipped = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(bilty.shipped));

const kb = bilty.bytes ? `${Math.round(bilty.bytes / 1024)} kB` : null;
export const rows = [
  { label: 'Consignment', value: bilty.run ? `Run ${consignment}` : 'Local build', href: bilty.runUrl },
  { label: 'Commit', value: bilty.sha?.slice(0, 7) ?? 'unknown', href: bilty.shaUrl },
  { label: 'Shipped', value: `${shipped} PKT` },
  bilty.checks && { label: 'Checks passed', value: `${bilty.checks.passed} of ${bilty.checks.total}` },
  bilty.lighthouse && { label: 'Lighthouse', value: `Performance ${bilty.lighthouse.performance}, accessibility ${bilty.lighthouse.accessibility}` },
  kb && { label: 'Load', value: `${kb} shipped` },
  bilty.invalidation && { label: 'Invalidation', value: bilty.invalidation },
].filter(Boolean) as { label: string; value: string; href?: string | null }[];

export { bilty };
