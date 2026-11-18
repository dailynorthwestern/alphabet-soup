# Alphabet Soup

A static Astro project for The Daily Northwestern. The home page contains a full-height hero and three stories (MMSS, ISP, and LOC) between the newspaper header and footer.

## Run locally

Requires Node.js 22.17.0 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:4321/alphabet-soup/.

## Build and preview

```sh
npm run build
npm run preview
```

The production build is generated in `dist/`.

## Add story content

Paste the article into `src/content/mmss.md`, `src/content/isp.md`, or `src/content/loc.md`. Leave a blank line between paragraphs and use `####` for subheadings under the article headline. Files with no article text show placeholders.

Fill in `headline`, `reporter`, and `reporterUrl` between the opening `---` lines. The reporter’s name links to their profile when a URL is provided. For shared typography and spacing, edit `--article-headline-font`, `--article-body-font`, and `--article-paragraph-gap` in `src/components/StoryContent.astro`.

Put story photos in `src/assets/` and add each image in the Markdown file wherever it should appear:

```md
![Describe what the photo shows](../assets/mmss-classroom.jpg)
```

Edit the opening and closing pull quotes in the matching `*StudentCard.astro` and `*FacultyCard.astro` files under `src/components/`. Pass portraits and media as props to the shared cards. For card assets in `public/`, prefix URLs with `import.meta.env.BASE_URL`. For images imported from `src/assets/`, pass the imported image's `.src`.
