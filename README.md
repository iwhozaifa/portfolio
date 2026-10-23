# Ali Huzaifa — portfolio

Personal portfolio of Ali Huzaifa: cloud systems, the pipelines that ship them, and the receipts.

Static [Astro](https://astro.build) site, art-directed with the `design-taste-frontend` skill (theme "Grand Trunk"),
hosted on AWS (S3 + CloudFront + Route 53 + ACM) defined in CDK. The full build plan is in [`docs/PLAN.md`](docs/PLAN.md).

## Run it

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run taste:lint # house-style scan of src/
npm run setup:chrome && npm run build && npm run taste:inspect  # real-browser check at 1440/768/390
```

`setup:chrome` makes Playwright's Chromium run on WSL/Ubuntu without sudo (it unpacks NSS, NSPR and ALSA
into `.cache/chrome-libs`). On a machine with Chrome installed, `taste:inspect` finds it on its own.

Requires Node 22.12+ (see `.nvmrc`).

## Contributing

Every change reaches `main` through a squash-merged pull request with a green `ci` check.
See [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md).
