import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Blumen',
  description: 'a CLI and API library to deploy apps on the decentralized web using IPFS and Ethereum.',
  themeConfig: {
    nav: [{ text: 'Docs', link: '/' }],
    search: {
      provider: 'local',
    },

    sidebar: [
      {
        text: 'Introduction',
        items: [
          {
            text: 'Getting Started',
            link: '/',
          },
          {
            text: 'Providers',
            link: '/docs/providers',
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
        ],
      },
      {
        text: 'API (W.I.P.)',
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/StauroXYZ/blumen' },
    ],
  },
})
