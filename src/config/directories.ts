export type DirectoryListing = {
  name: string;
  href: string;
  /** Official badge asset, when the directory provides one. */
  badge?: { src: string; width: number; height: number; alt: string };
  /** Shown under the badge (or as the chip label) to say what it is. */
  note: string;
};

/**
 * Real, published directory listings for Formivo.
 *
 * Only add an entry when the listing is live: a "featured on" badge that points at a
 * missing profile is a false claim, and directories remove badges for it. Badges use the
 * official embed assets, hot-linked exactly as each directory documents.
 */
export const directories: DirectoryListing[] = [
  {
    name: "Product Hunt",
    href: "https://www.producthunt.com/products/formivo",
    badge: {
      src: "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1308471&theme=light",
      width: 250,
      height: 54,
      alt: "Formivo on Product Hunt",
    },
    note: "Product page",
  },
  {
    name: "DevHunt",
    href: "https://devhunt.org/tool/formivo",
    note: "Developer tool listing",
  },
  {
    name: "Uneed",
    href: "https://www.uneed.best/tool/formivo",
    badge: {
      src: "https://www.uneed.best/EMBED3B.png",
      width: 250,
      height: 54,
      alt: "Launching soon on Uneed",
    },
    note: "Launching soon",
  },
  {
    name: "PeerPush",
    href: "https://peerpush.com/p/formivo",
    note: "Product listing",
  },
  {
    name: "Turbo0",
    href: "https://turbo0.com/item/formivo",
    badge: {
      src: "https://img.turbo0.com/badge-listed-light.svg",
      width: 160,
      height: 54,
      alt: "Listed on Turbo0",
    },
    note: "Listed tool",
  },
  {
    name: "Twelve Tools",
    href: "https://twelve.tools",
    badge: {
      src: "https://twelve.tools/badge0-white.svg",
      width: 148,
      height: 40,
      alt: "Featured on Twelve Tools",
    },
    note: "Featured",
  },
  {
    name: "Startup Fame",
    href: "https://startupfa.me/s/formivo?utm_source=formivo.faizyab.me",
    badge: {
      src: "https://startupfa.me/badge?t=classic&theme=default",
      width: 171,
      height: 54,
      alt: "Formivo on Startup Fame",
    },
    note: "Featured startup",
  },
  {
    name: "Fazier",
    href: "https://fazier.com/launches/formivo.faizyab.me",
    badge: {
      src: "https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light",
      width: 120,
      height: 54,
      alt: "Launched on Fazier",
    },
    note: "Launch",
  },
  {
    name: "SideProjectors",
    href: "https://www.sideprojectors.com/project/108732/formivo",
    note: "Project listing",
  },
  {
    name: "Awesome Indie",
    href: "https://awesomeindie.com/product/formivo?ref=badge",
    note: "Launching soon",
  },
  {
    name: "Peerlist",
    href: "https://peerlist.io/faizyb/project/formivo",
    note: "Project page",
  },
  {
    name: "TinyLaunch",
    href: "https://www.tinylaunch.com/launch/31034-formivo",
    note: "Launch page",
  },
  {
    name: "StackShare",
    href: "https://stackshare.io/formivo",
    note: "Tool profile",
  },
];
