# Installation

## JavaScript package managers

Blumen supports Node.js (20+), Deno (2.2.11+) and Bun.

::: code-group

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

## Building from source

Node.js (20+) and pnpm are required.

```sh
git clone https://github.com/StauroDEV/blumen.git
cd blumen
pnpm install
pnpm build
pnpm link -g # this will add blumen to $PATH
```