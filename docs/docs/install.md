# Installation

Blumen supports one of the these JavaScript runtimes: [Node.js](https://nodejs.org) (20+), [Deno](https://deno.com) (2.2.11+) and [Bun](https://bun.sh).

## JavaScript package managers

:::code-group

```bash [npm]
npm i -g blumen
```

```bash [pnpm]
pnpm i -g blumen
```

```bash [bun]
bun i -g blumen
```

```bash [deno]
deno install --global --allow-read --allow-env --allow-write --allow-net npm:blumen
```

:::

## CDN

If you don't have a package manager installed, it is possible to fetch the distribution directly from CDNs.

:::code-group

```bash [jsDelivr]
curl -o blumen.js https://cdn.jsdelivr.net/npm/blumen/dist/cli.js
```

```bash [unpkg]
curl -o blumen.js https://unpkg.com/blumen/dist/cli.js
```

```bash [nobsdelivr]
curl -o https://nobsdelivr.private.coffee/npm/blumen/dist/cli.js
```

:::

Then run as

```sh
node ./blumen.js deploy
```
