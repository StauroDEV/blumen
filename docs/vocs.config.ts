import rehypeMermaid from 'rehype-mermaid'
import { defineConfig } from 'vocs'

export default defineConfig({
  title: 'Blumen',
  socials: [
    { icon: 'github', link: 'https://github.com/StauroDEV/blumen' },
  ],

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
            link: '/cli/deploy',
          },
          {
            text: 'Status',
            link: '/cli/status',
          },
          {
            text: 'ENS',
            link: '/cli/ens',
          },
          {
            text: 'Ping',
            link: '/cli/ping',
          },
          {
            text: 'DNSLink',
            link: '/cli/dnslink',
          },
          {
            text: 'Pack',
            link: '/cli/pack',
          },
          {
            text: 'Pin',
            link: '/cli/pin',
          },
        ],
      },
    ],
  markdown: {
    rehypePlugins: [
      rehypeMermaid,
    ]
  }
})
