import rehypeMermaid from 'rehype-mermaid'
import { defineConfig } from 'vocs'

export default defineConfig({
  title: 'Blumen',
  description: 'Deploy apps on the decentralized web without compromises',
  socials: [{ icon: 'github', link: 'https://github.com/StauroDEV/blumen' }],
  sponsors: [
    // {
    //   name: 'Collaborator',
    //   height: 80,
    //   items: [
    //     [
    //       {
    //         name: 'Lido',
    //         link: 'https://lido.fi',
    //         image: '/lido.svg',
    //       },
    //     ],
    //   ],
    // },
    {
      name: 'Used by',
      height: 80,
      items: [
                [
          {
            name: 'Lido',
            link: 'https://lido.fi',
            image: '/lido.svg',
          },
        ],
        [
          {
            name: 'WalletBeat',
            link: 'https://beta.walletbeat.eth.limo',
            image: '/WalletBeat.svg',
          },
          {
            name: 'StorageBeat',
            link: 'https://storagebeat.eth.link',
            image: '/StorageBeat.svg',
          },
        ],
        [
          {
            name: 'v1rtl.site',
            link: 'https://v1rtl.eth.link',
            image: '/v1rtl-site.webp',
          }
        ]
      ],
    },
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
      ],
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
    rehypePlugins: [rehypeMermaid],
  },
})
