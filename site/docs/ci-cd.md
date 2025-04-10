# CI/CD

Blumen can be integrated with CI/CD pipelines to deploy your dapps automatically.

## GitHub Actions

Blumen uses this GitHub Action to deploy it's own website.

```yaml
name: Deploy with Blumen
on:
  push:
    branches: main
  workflow_dispatch: {}
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: install pnpm
        uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
          cache: "pnpm"
      - name: Install Blumen
        run: pnpm i -g blumen@0.14.3
      - name: Build website
        run: pnpm i && pnpm build
      - name: Deploy
        run: blumen deploy
        env: # your provider API tokens go here
          BLUMEN_CF_KEY: ${{ secrets.BLUMEN_CF_KEY }}
          BLUMEN_CF_ZONE_ID: ${{ secrets.BLUMEN_CF_ZONE_ID }}
          BLUMEN_PINATA_TOKEN: ${{ secrets.BLUMEN_PINATA_TOKEN }}
          BLUMEN_STORACHA_PROOF: ${{ secrets.BLUMEN_STORACHA_PROOF }}
          BLUMEN_STORACHA_TOKEN: ${{ secrets.BLUMEN_STORACHA_TOKEN }}
```

## GitLab CI

Before executing the pipeline, you need to set up the following environment variables:

1. Go to your GitLab project.

2. Click Settings > CI/CD > expand the Variables section.

3. Click "Add variable" and add the API tokens in use.

4. Set them as "Masked" and "Protected" if you only want them available in protected branches (like main).

```yaml
deploy:
  stage: deploy
  image: node:22
  script:
    - pnpm i -g blumen@0.14.3
    - pnpm i && pnpm build
    - blumen deploy
  only:
    - main
```