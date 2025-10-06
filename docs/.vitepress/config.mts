import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Blumen",
  description: "Supercharged dweb deployments",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
