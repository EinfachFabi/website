# My Astro Website

My personal website / blog covering **Tech Guides, Linux, Systems & Travel Impressions**, built with [Astro](https://astro.build/).

## Quick Start

### Prerequisites

- **Node.js** `>= 22.22.0`
- **npm**

### Local Development

Clone the repository, install dependencies, and start the local development server:

```bash
git clone https://github.com/EinfachFabi/website.git
cd website
npm ci
npm run dev
```

If you prefer running the Astro dev server in the background:

```bash
npx astro dev --background
```

You can manage the background server using `npx astro dev status`, `npx astro dev logs`, and `npx astro dev stop`.

## Creating a New Post

Posts live inside `src/content/posts/<year>/<slug>/<slug>.md` alongside their thumbnail and article images. The Markdown filename (`<slug>.md`) determines the published URL (`/<slug>/`).

1. Create a new folder for your post inside the current year directory:
   ```bash
   mkdir -p src/content/posts/2026/my-new-post
   ```
2. Create the Markdown file `src/content/posts/2026/my-new-post/my-new-post.md` with the following frontmatter:
   ```markdown
   ---
   title: "My New Post"
   description: "Quick summary of the post."
   pubDate: 2026-10-23
   category: "Linux"
   image: "./thumb.png"
   tags: ["linux", "guide"]
   featured: false
   draft: false
   ---

   Write your Markdown content here...
   ```
3. Place your cover image (`thumb.png` / `thumb.jpg` / `thumb.svg`) and any inline images (`![Image](./bild1.png)`) in the same folder.

### Frontmatter Fields

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | *Required* | Post title |
| `description` | `string` | *Required* | Short summary shown on cards and in metadata |
| `pubDate` | `date` | *Required* | Publication date (`YYYY-MM-DD`) |
| `updatedDate` | `date` | *Optional* | Last updated date (`YYYY-MM-DD`) |
| `category` | `string` | `"Linux"` | Main topic (e.g. `Linux`, `Travel`, `Homelab`, `Windows`) |
| `tags` | `string[]` | `[]` | List of topic tags |
| `image` | `string` | *Optional* | Relative path to thumbnail (e.g. `./thumb.png`) or public path |
| `featured` | `boolean` | `false` | Pin post to the featured section |
| `draft` | `boolean` | `false` | Hide post from production listings when `true` |

## Build & Preview

Build the static production site into `dist/` and preview it locally:

```bash
# Build production output into dist/
npm run build

# Preview the production build locally
npm run preview
```

## Repository Layout

- `src/pages/` — Astro routes and page templates (`/`, `/tech`, `/travel`, `/posts`, `/categories`, `/about`, and dynamic post routes `/[id]`)
- `src/layouts/` — Shared site layouts, navigation, theme toggle, and global styling ([`Layout.astro`](src/layouts/Layout.astro))
- `src/content/posts/` — Blog articles organized by year (`<year>/<slug>/<slug>.md`) with co-located images
- `src/content.config.ts` — Astro Content Collection schema and loader configuration
- `src/components/` — Reusable Astro UI components
- `public/` — Static assets copied directly to the build root (`favicon.svg`, fallback thumbnails in `public/images/thumbs/`)
