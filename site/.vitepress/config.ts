
import { withMermaid } from "vitepress-plugin-mermaid"

const radicleIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none"><script xmlns=""/><script xmlns="" type="text/javascript"/>
  <g shape-rendering="crispEdges">
    <rect x="8" y="0" width="4" height="4" fill="000000"/>
    <rect x="32" y="0" width="4" height="4" fill="000000"/>
    <rect x="12" y="4" width="4" height="4" fill="000000"/>
    <rect x="28" y="4" width="4" height="4" fill="000000"/>
    <rect x="12" y="8" width="4" height="4" fill="000000"/>
    <rect x="16" y="8" width="4" height="4" fill="000000"/>
    <rect x="20" y="8" width="4" height="4" fill="000000"/>
    <rect x="24" y="8" width="4" height="4" fill="000000"/>
    <rect x="28" y="8" width="4" height="4" fill="000000"/>
    <rect x="8" y="12" width="4" height="4" fill="000000"/>
    <rect x="12" y="12" width="4" height="4" fill="000000"/>
    <rect x="16" y="12" width="4" height="4" fill="000000"/>
    <rect x="20" y="12" width="4" height="4" fill="000000"/>
    <rect x="24" y="12" width="4" height="4" fill="000000"/>
    <rect x="28" y="12" width="4" height="4" fill="000000"/>
    <rect x="32" y="12" width="4" height="4" fill="000000"/>
    <rect x="4" y="16" width="4" height="4" fill="000000"/>
    <rect x="8" y="16" width="4" height="4" fill="000000"/>
    <rect x="12" y="16" width="4" height="4" fill="#F4F4F4"/>
    <rect x="16" y="16" width="4" height="4" fill="#F4F4F4"/>
    <rect x="20" y="16" width="4" height="4" fill="000000"/>
    <rect x="24" y="16" width="4" height="4" fill="000000"/>
    <rect x="28" y="16" width="4" height="4" fill="#F4F4F4"/>
    <rect x="32" y="16" width="4" height="4" fill="#F4F4F4"/>
    <rect x="36" y="16" width="4" height="4" fill="000000"/>
    <rect x="4" y="20" width="4" height="4" fill="000000"/>
    <rect x="8" y="20" width="4" height="4" fill="000000"/>
    <rect x="12" y="20" width="4" height="4" fill="#F4F4F4"/>
    <rect x="16" y="20" width="4" height="4" fill="#FF55FF"/>
    <rect x="20" y="20" width="4" height="4" fill="000000"/>
    <rect x="24" y="20" width="4" height="4" fill="000000"/>
    <rect x="28" y="20" width="4" height="4" fill="#F4F4F4"/>
    <rect x="32" y="20" width="4" height="4" fill="#FF55FF"/>
    <rect x="36" y="20" width="4" height="4" fill="000000"/>
    <rect x="0" y="24" width="4" height="4" fill="000000"/>
    <rect x="4" y="24" width="4" height="4" fill="000000"/>
    <rect x="8" y="24" width="4" height="4" fill="000000"/>
    <rect x="12" y="24" width="4" height="4" fill="000000"/>
    <rect x="16" y="24" width="4" height="4" fill="000000"/>
    <rect x="20" y="24" width="4" height="4" fill="000000"/>
    <rect x="24" y="24" width="4" height="4" fill="000000"/>
    <rect x="28" y="24" width="4" height="4" fill="000000"/>
    <rect x="32" y="24" width="4" height="4" fill="000000"/>
    <rect x="36" y="24" width="4" height="4" fill="000000"/>
    <rect x="40" y="24" width="4" height="4" fill="000000"/>
    <rect x="8" y="28" width="4" height="4" fill="000000"/>
    <rect x="16" y="28" width="4" height="4" fill="000000"/>
    <rect x="24" y="28" width="4" height="4" fill="000000"/>
    <rect x="32" y="28" width="4" height="4" fill="000000"/>
    <rect x="8" y="32" width="4" height="4" fill="000000"/>
    <rect x="16" y="32" width="4" height="4" fill="000000"/>
    <rect x="24" y="32" width="4" height="4" fill="000000"/>
    <rect x="32" y="32" width="4" height="4" fill="000000"/>
    <rect x="16" y="36" width="4" height="4" fill="000000"/>
    <rect x="24" y="36" width="4" height="4" fill="000000"/>
    <rect x="12" y="40" width="4" height="4" fill="000000"/>
    <rect x="16" y="40" width="4" height="4" fill="000000"/>
    <rect x="24" y="40" width="4" height="4" fill="000000"/>
    <rect x="28" y="40" width="4" height="4" fill="000000"/>
  </g>
</svg>`

// https://vitepress.dev/reference/site-config
export default withMermaid({
  title: 'Blumen',
  description:
    'a CLI to deploy apps on the decentralized web using IPFS and Ethereum.',
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['meta', {
      property: 'og:description',
      content:
        'a CLI to deploy apps on the decentralized web using IPFS and Ethereum.',
    }],
    ['meta', {
      property: 'og:image',
      content: 'http://blumen.stauro.dev/blumen.jpg',
    }],
  ],
  themeConfig: {
    nav: [{ text: 'Docs', link: '/' }],
    search: {
      provider: 'local',
    },
    logo: '/logo.png',
    sidebar: [
      {
        text: 'Introduction',
        link: '/',
        items: [
          {
            text: 'How it works',
            link: '/docs/how-it-works',
          },
          {
            text: 'Installation',
            link: '/docs/install',
          },
          {
            text: 'Getting Started',
            link: '/docs/get-started',
          },
        ],
      },
      {
        text: 'Guides',
        items: [
          {
            text: 'IPFS',
            link: '/docs/ipfs',
          },
          {
            text: 'Swarm',
            link: '/docs/swarm',
          },
          {
            text: 'Deploying with Safe',
            link: '/docs/safe',
          },
          {
            text: 'DNSLink',
            link: '/docs/dnslink',
          },
          {
            text: 'CI/CD',
            link: '/docs/ci-cd',
          },
        ]
      },
      {
        text: 'CLI Reference',
        items: [
          {
            text: 'Deploy',
            link: '/docs/cli/deploy',
          },
          {
            text: 'Status',
            link: '/docs/cli/status',
          },
          {
            text: 'ENS',
            link: '/docs/cli/ens',
          },
          {
            text: 'Ping',
            link: '/docs/cli/ping',
          },
          {
            text: 'DNSLink',
            link: '/docs/cli/dnslink',
          },
          {
            text: 'Pack',
            link: '/docs/cli/pack',
          },
          {
            text: 'Pin',
            link: '/docs/cli/pin',
          },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/StauroDEV/blumen' },
      { icon: {svg: radicleIcon}, link: 'https://app.radicle.xyz/nodes/seed.radicle.garden/rad%3Az2SqXAoWoZpnrqLxbeigSqjd2b2g2' }
    ],
  },
})
