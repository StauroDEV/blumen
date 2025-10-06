<template>
    <div :class="$style.root">
        <template v-for="(sponsorSet, i) in sponsorSections" :key="i">
            <div :class="$style.title">{{ sponsorSet.title }}</div>
            <div
                v-for="(sponsorRow, j) in chunkSponsorsByOwnColumns(
                    sponsorSet.sponsors,
                )"
                :key="j"
                :class="$style.row"
                :style="{
                    '--columns': sponsorRow.length,
                }"
            >
                <a
                    v-for="(sponsor, k) in sponsorRow"
                    :key="k"
                    :href="sponsor?.href"
                    :style="{
                        '--height': sponsor.height,
                    }"
                    :class="[$style.column, sponsor ? $style.sponsor : null]"
                    class="styleless-link"
                >
                    <img
                        v-if="sponsor?.img"
                        :class="$style.image"
                        :src="sponsor?.img"
                        :alt="sponsor?.name"
                    />
                </a>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed } from "vue";

const sponsorSections = [
    {
        title: "In collaboration with",
        sponsors: [
            {
                name: "Lido",
                href: "https://bafybeiecvujvs74xvxgpwctmbfkcucazyaudmwuiw4wfv6ys7uio7o376u.ipfs.dweb.link",
                img: "/lido.svg",
                columns: 1,
                height: "120px",
            },
        ],
    },
    {
        title: "Used by",
        sponsors: [
            {
                name: "WalletBeat",
                href: "https://beta.walletbeat.eth.limo",
                img: "/WalletBeat.svg",
                columns: 2,
                height: "80px",
            },
            {
                name: "StorageBeat",
                href: "https://storagebeat.eth.link",
                img: "/StorageBeat.svg",
                columns: 2,
                height: "80px",
            },
            {
                name: "v1rtl.site",
                href: "https://v1rtl.eth.link",
                img: "/v1rtl-site.webp",
                columns: 1,
                height: "120px",
            },
        ],
    },
];

// Function to chunk sponsors based on columns
const chunkSponsorsByOwnColumns = (sponsors) => {
    const result = [];
    let i = 0;
    while (i < sponsors.length) {
        const columns = sponsors[i].columns || 1;
        result.push(sponsors.slice(i, i + columns));
        i += columns;
    }
    return result;
};
</script>

<style module scoped>
.root {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    overflow: hidden;
    max-width: var(--vp-layout-max-width);
    margin: 0 auto;
    padding: 2rem 24px;
}

@media (min-width: 640px) {
    .root {
        padding: 2rem 3rem;
    }
}

@media (min-width: 960px) {
    .root {
        padding: 2rem 4rem;
    }
}

@media (min-width: 1270px) {
    .root {
        padding: 2rem 0;
        max-width: 1152px;
    }
}

.title {
    color: var(--vp-c-text-2);
    font-size: 13px;
    font-weight: 500;
    padding: 4px 0;
    text-align: center;
}

.title,
.column {
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
}

.root .title:first-of-type {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.row {
    display: flex;
    flex-direction: row;
    gap: 0.25rem;
}

.column {
    align-items: center;
    display: flex;
    justify-content: center;
    padding: 32px;
    width: calc(100% / var(--columns));
}

.row:last-of-type .column:first-of-type {
    border-bottom-left-radius: 8px;
}

.row:last-of-type .column:last-of-type {
    border-bottom-right-radius: 8px;
}
.sponsor {
    transition: background-color 0.1s;
}
.sponsor:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.image {
    filter: grayscale(1);
    height: var(--height);
    transition: filter 0.1s;
    padding: 0.25rem;
}
:global(html.dark) .image {
    filter: grayscale(1) invert(1);
}

/* Style for links to remove default styling */
.styleless-link {
    text-decoration: none;
    color: inherit;
}
</style>
