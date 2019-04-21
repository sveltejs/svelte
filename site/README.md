## Running locally

Set up the project:

```bash
git clone https://github.com/sveltejs/svelte.git
cd svelte/site
npm ci
npm run update
```

Start the server with `npm run dev`, and navigate to [localhost:3000](http://localhost:3000).

## Using a local copy of Svelte

By default, the REPL will fetch the most recent version of Svelte from https://unpkg.com/svelte. To use the local copy of the compiler and runtime from this repo, you can navigate to [localhost:3000/repl?version=local](http://localhost:3000/repl?version=local). To produce the proper browser-compatible UMD build, you will need to run `npm run build` with the `PUBLISH` environment variable set (to any non-empty string).

## REPL GitHub integration

In order for the REPL's GitHub integration to work properly when running locally, you will need to create a GitHub OAuth app. Set its authorization callback URL to `http://localhost:3000/auth/callback`, and in this project, create `site/.env` containing:

```
GITHUB_CLIENT_ID=[your app's client id]
GITHUB_CLIENT_SECRET=[your app's client secret]
BASEURL=http://localhost:3000
```
