const sh = require('shelljs');
const fs = require('fs');

sh.cd(__dirname + '/../');

// fetch svelte app
sh.rm('-rf','scripts/svelte-app');
sh.exec('npx degit sveltejs/template scripts/svelte-app');

// remove src (will be recreated client-side) and node_modules
sh.rm('-rf', 'scripts/svelte-app/src');
sh.rm('-rf', 'scripts/svelte-app/node_modules');

// build svelte-app.json
const appPath = 'scripts/svelte-app';
const files = [];

for (const path of sh.find(appPath).filter(p => fs.lstatSync(p).isFile()) ) {
	const bytes = fs.readFileSync(path);
	const string = bytes.toString();
	const data = bytes.compare(Buffer.from(string)) === 0 ? string : [...bytes];
	files.push({ path: path.slice(appPath.length + 1), data });
}

fs.writeFileSync('static/svelte-app.json', JSON.stringify(files));