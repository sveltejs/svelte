const sh = require('shelljs');
const fs = require('fs')

sh.cd(__dirname+'/../')

// fetch svelte app
sh.rm('-rf','scripts/svelte-app')
sh.exec('npx degit sveltejs/template scripts/svelte-app')

// update repl-viewer.css based on template
sh.cp('scripts/svelte-app/public/global.css', 'static/repl-viewer.css')

// remove src (will be recreated client-side) and node_modules
sh.rm('-rf', 'scripts/svelte-app/src')
sh.rm('-rf', 'scripts/svelte-app/node_modules')

// build svelte-app.json
const appPath = 'scripts/svelte-app'
let files = []

for (const path of sh.find(appPath).filter(p => fs.lstatSync(p).isFile()) ) {
    files.push({ path: path.slice(appPath.length + 1), data: fs.readFileSync(path).toString() });
}

fs.writeFileSync('static/svelte-app.json', JSON.stringify(files));

