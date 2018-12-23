const fs = require('fs');

const files = [];

for (const path of process.argv.slice(2)) {
	if (!path.includes('/.')) {
		files.push({ path: path.slice(19), data: fs.readFileSync(path).toString() });
	}
}

fs.writeFileSync('static/svelte-app.json', JSON.stringify(files));
