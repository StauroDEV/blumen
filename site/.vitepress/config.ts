import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
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
            text: 'Getting Started',
            link: '/docs/get-started',
          },
          {
            text: 'Providers',
            link: '/docs/providers',
          },
          {
            text: 'Deploying with Safe',
            link: '/docs/safe',
          },
          {
            text: 'DNSLink',
            link: '/docs/dnslink',
          }, {
            text: 'Swarm',
            link: '/docs/swarm',
          },
          {
            text: 'CI/CD',
            link: '/docs/ci-cd',
          },

        ],
      },
      {
        text: 'CLI',
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
    ],
  },
})
