import { defineConfig } from 'vocs'

export default defineConfig({
  title: 'Blumen',
  logoUrl: {
    dark: '/logo-dark.svg',
    light: '/logo-text.svg',
  },
  description: 'Self-custodial decentralized deployments',
  socials: [{ icon: 'github', link: 'https://github.com/StauroDEV/blumen' }],
  sponsors: [
    {
      name: 'In collaboration with',
      height: 80,
      items: [
        [
          {
            name: 'Lido',
            link: 'https://bafybeiecvujvs74xvxgpwctmbfkcucazyaudmwuiw4wfv6ys7uio7o376u.ipfs.dweb.link',
            image: '/lido.svg',
          },
        ],
      ],
    },
    {
      name: 'Used by',
      height: 80,
      items: [
        [
          {
            name: 'WalletBeat',
            link: 'https://beta.walletbeat.eth.limo',
            image: '/WalletBeat.svg',
          },
        ],
        [
          {
            name: 'StorageBeat',
            link: 'https://storagebeat.eth.link',
            image: '/StorageBeat.svg',
          },
          {
            name: 'v1rtl.site',
            link: 'https://v1rtl.eth.link',
            image: '/v1rtl-site.webp',
          },
        ],
      ],
    },
  ],
  sidebar: [
    {
      text: 'Introduction',
      items: [
        {
          text: 'Get Started',
          link: '/docs',
        },
        {
          text: 'How it works',
          link: '/docs/how-it-works',
        },
        {
          text: 'Installation',
          link: '/docs/install',
        },
        {
          text: 'Why Blumen?',
          link: '/docs/why',
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
})
