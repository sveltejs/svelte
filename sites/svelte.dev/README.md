## Running locally

A local database is only required in dev mode if you want to test reading and writing saved REPLs on it. Without a local database in dev mode, the REPL will be able to load saved REPLs from the production database, but not save them.

Note also that in dev mode, the REPL requires support for [`import` statements in web workers](https://caniuse.com/mdn-javascript_operators_import_worker_support), [as noted in the Vite documentation](https://vitejs.dev/guide/features.html#web-workers). You may need to update your browser to the latest version.

If you do want to use a database, set it up on [Supabase](https://supabase.com) with the instructions [here](https://github.com/sveltejs/sites/tree/master/db) and set the corresponding environment variables.

Build the `svelte` package, then run the site sub-project:

```bash
pnpm install
pnpm --dir ../../packages/svelte build
pnpm dev
```

and navigate to [localhost:5173](http://localhost:5173).

The first time you run the site locally, it will update the list of Contributors, REPL dependencies and examples data that is used on the [examples page](https://svelte-dev-2.vercel.app/examples). After this it won't run again unless you force it by running:

```bash
pnpm run update
```

## Running using the local copy of Svelte

By default, the REPL will fetch the most recent version of Svelte from https://unpkg.com/svelte. When running the site locally, you can also use your local copy of Svelte.

To produce the proper browser-compatible UMD build of the compiler, you will need to run `npm run build` (or `npm run dev`) in the `svelte` repository with the `PUBLISH` environment variable set to any non-empty string:

```bash
git clone https://github.com/sveltejs/svelte.git
cd svelte
pnpm i --frozen-lockfile
PUBLISH=1 npm run build
```

The default configuration assumes that the `sites` repository and the `svelte` repository are in the same directory. If not, you can set `LOCAL_SVELTE_PATH` in `sites/svelte.dev/.env` to a different path to the local copy of Svelte.

Then visit the REPL at [localhost:5173/repl?version=local](http://localhost:5173/repl?version=local). Please note that the local REPL only works with `pnpm dev` and not when building the site for production usage.

## REPL GitHub integration

In order for the REPL's GitHub integration to work properly when running locally, you will need to:

- [create a GitHub OAuth app](https://github.com/settings/developers):
  - set `Authorization callback URL` to `http://localhost:5173/auth/callback`;
  - set `Application name` as you like, and `Homepage URL` as `http://localhost:5173/`;
  - create the app and take note of `Client ID` and `Client Secret`
- in this directory, create an `.env.local` file (see `.env.example`) containing:
  ```
  GITHUB_CLIENT_ID=[your app's Client ID]
  GITHUB_CLIENT_SECRET=[your app's Client Secret]
  ```

The GitHub app requires a specific callback URL, and so cannot be used with the preview deployment in the staging environment.

## Building the site

To build the website, run `pnpm build`. The output can be found in `.vercel`.

## Testing

Tests can be run using `pnpm test`.

## Docs & other content

All the docs, examples, tutorials, FAQ live in the [documentation](../../documentation) directory, outside the site sub-project. If you modify these, and your app server is running, you will need to reload the page to see the changes.

Following are the file structures of the different kind of documentations

### Docs structure

```txt
- documentation/docs
  - 01-getting-started                  <- Category
    - meta.json                           <- Metadata
    - 01-introduction.md                  <- Page
  - 02-template-syntax                  <- Category
    - meta.json                           <- Metadata
    - 01-logic-blocks.md                  <- Page
    - 02-special-tags.md                  <- Page
    - 03-element-directives.md            <- Page
```

If you are creating a new page, it must be within a category. That is, you can't have a .md file in the `docs` directory's root level. You may have a category without any pages in it, but you can't have a page without a category. You can add the new page in an existing category, or create your own, for example:

```txt
- documentation/docs
  <!-- Rest of the docs -->
+ - 07-my-new-category                  <- Category
+   - 01-my-new-page.md                  <- Page
```

The numbers in front of category folders and page files are just for ordering the content. They may not be consecutive. Their only purpose exists for the docs author to decide how the content is arranged.

> Because of hardcoded regex in docs processing code, the numbers prefixed to pages are REQUIRED and _must be two digits_.

The name of the file is what determines the URL of the page. For example, the URL of `01-introduction.md` is `https://svelte.dev/docs/introduction`. The URL of `02-special-tags.md` is `https://svelte.dev/docs/special-tags`. Even though these are in categories, the URL does not contain the category name. Keep this in mind when creating new pages, as two pages with same slug in different categories will clash.

**meta.json** files contain data about the current category. At the time of writing it only has one field: `title`

```json
{
  "title": "Getting Started"
}
```

This `title` field is used as category text in the sidebar on docs page.

Every single .md file in the docs must have frontmatter with `title` in it. For example, this is how the frontmatter of `02-logic-blocks.md` looks like:

```md
---
title: .svelte files
---

Components are the building blocks of Svelte applications. They are written into `.svelte` files, using a superset of HTML.

All three sections — script, styles and markup — are optional.

<!-- REST OF THE CONTENT -->
```

You need not specify a h1 tag(or in markdown, a `#`). The `title` field in the frontmatter will be used as the h1 tag.

The headings in the document must start from h2(`##`). That is, you can't have an h1 tag in the document. h2(`##`), h3(`###`), h4(`####`) and h5(`#####`) are all valid.

#### Processing

Docs are processed in the [`src/lib/server/docs/index.js`](./src/lib/server/docs/index.js) file. It is responsible for reading the docs from filesystem and accumulating the metadata in forms of arrays and objects and for _rendering_ the markdown files into HTML. These functions are then imported into [src/routes/docs/+layout.server.js](./src/routes/docs/+layout.server.js) and used to generate docs list, and similarly in [src/routes/docs/%5Bslug%5D/+page.server.js](./src/routes/docs/%5Bslug%5D/%2Bpage.server.js) and are rendered there.

### Tutorial structure

```txt
- documentation/tutorial
  - 01-introduction                   <- Category
    - meta.json                           <- Metadata
    - 01-basics                       <- Page's content folder
      - text.md                           <- Text content of tutorial
      - app-a                             <- The initial app folder
        - App.svelte
        - store.js
      - app-b                             <- The final app folder. Not always present
        - App.svelte
        - store.js
```

Similar to how docs are structured, only difference is that the pages are in a folders, and their content is in a `text.md` file. Alongside, are two folders, _app-a_ and _app-b_. These are the initial and final apps respectively. The initial app is the one that the tutorial shows, and the final app is the one that the tutorial switches to after user clicks on the **Show me** button.

> app-b is not always there. This means that the _Show me_ button is not present for that page.

The naming scheme of docs is followed here as well. The numbers in front of the folders are just for ordering the content. They may not be consecutive. Their only purpose exists for the tutorial author to decide how the content is arranged. _And they are compulsary_.

#### Processing

Tutorials are processed in the [`src/lib/server/tutorial/index.js`](./src/lib/server/tutorial/index.js) file. It is responsible for reading the tutorials from filesystem and accumulating the metadata in forms of arrays and objects and has the code responsible for _rendering_ the markdown files into HTML. These functions are then imported into [src/routes/tutorial/+layout.server.js](./src/routes/tutorial/%2Blayout.server.js) and used to generate tutorial list, and similarly in [src/routes/tutorial/%5Bslug%5D/+page.server.js](./src/routes/tutorial/%5Bslug%5D/%2Bpage.server.js) and are rendered there.

### Examples structure

```txt
- documentation/examples
  - 00-introduction                   <- Category
    - meta.json                           <- Metadata
    - 00-hello-world                    <- Page's content folder
      - meta.json                           <- Metadata
      - App.svelte                        <- code files
  - 01-reactivity                     <- Category
    - meta.json                           <- Metadata
    - 00-reactive-assignments         <- Page's content folder
      - meta.json                           <- Metadata
      - App.svelte                          <- code files
```

Similar to the tutorial, only difference: There is no `text.md`, and the code files are kept right in the folder, not in `app-` folder.

Same naming scheme as docs and tutorial is followed.

#### Processing

Examples are processed in the [`src/lib/server/examples/index.js`](./src/lib/server/examples/index.js) folder. It is responsible for reading the examples from filesystem and accumulating the metadata in forms of arrays and objects, and for _rendering_ the markdown files into HTML. These functions are then imported into [src/routes/examples/%5Bslug%5D/+page.server.js](./src/routes/examples/%5Bslug%5D/%2Bpage.server.js) and are rendered there.

### Blog structure

```txt
- documentation/blog
  - 2019-01-01-my-first-post.md
  - 2019-01-02-my-second-post.md
```

Compared to the rest of the content, blog posts are not in a folder. They are placed at the root of `documentation/blog` folder. The name of the file is the date of the post, followed by the slug of the post. The slug is the URL where the blog post is available. For example, the slug of `2019-01-01-my-first-post.md` is `my-first-post`.

All the metadata about the blog post is mentioned in the frontematter of a post. For example, this is how the frontmatter of [2023-03-09-zero-config-type-safety.md](../../documentation/blog/2023-03-09-zero-config-type-safety.md) looks like:

```md
---
title: Zero-effort type safety
description: More convenience and correctness, less boilerplate
author: Simon Holthausen
authorURL: https://twitter.com/dummdidumm_
---
```

#### Processing

Blog posts are processed in the [`src/lib/server/blog/index.js`](./src/lib/server/blog/index.js) file. It is responsible for reading the blog posts from filesystem and accumulating the metadata in forms of arrays and objects, and for _rendering_ the markdown files into HTML. These functions are then imported into [src/routes/blog/+page.svelte](./src/routes/blog/%2Bpage.server.js), where they show the list of blogs. The rendering function is imported in [src/routes/blog/%5Bslug%5D/+page.server.js](./src/routes/blog/%5Bslug%5D/%2Bpage.server.js) and renders the individual blog post there.

## Translating the API docs

Anchors are automatically generated using headings in the documentation and by default (for the english language) they are latinised to make sure the URL is always conforming to RFC3986.

If we need to translate the API documentation to a language using unicode chars, we can setup this app to export the correct anchors by setting up `SLUG_PRESERVE_UNICODE` to `true` in `config.js`.
