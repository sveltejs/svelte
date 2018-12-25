const fs = require('fs');
const fetch = require('node-fetch');

process.chdir(__dirname);

fetch(`https://api.github.com/repos/sveltejs/svelte/stats/contributors`)
	.then(r => r.json())
	.then(contributors => {
		const munged = contributors
			.sort((a, b) => b.total - a.total)
			.map(({ author }) => ({ name: author.login, src: author.avatar_url }));

		const str = `[\n\t${munged.map(c => `{ name: '${c.name}', src: '${c.src}' }`).join(',\n\t')}\n]`;

		fs.writeFileSync(`../src/routes/_contributors.js`, `export default ${str};`);
	});