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
        link:'/',
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
            link: '/docs/safe'
          }
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
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/StauroDEV/blumen' },
    ],
  },
})
