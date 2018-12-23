cd `dirname $0`/..

# fetch svelte-app
rm -rf scripts/svelte-app
node_modules/.bin/degit sveltejs/template scripts/svelte-app

# update repl-viewer.css based on template
cp scripts/svelte-app/public/global.css static/repl-viewer.css

# remove src (will be recreated client-side) and node_modules
rm -rf scripts/svelte-app/src
rm -rf scripts/svelte-app/node_modules

# build svelte-app.json
node scripts/build-svelte-app-json.js `find scripts/svelte-app -type f`
