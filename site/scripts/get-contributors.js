const fs = require('fs');
const fetch = require('node-fetch');
const Jimp = require('jimp');

process.chdir(__dirname);

const SIZE = 64;

async function main() {
	const res = await fetch(`https://api.github.com/repos/sveltejs/svelte/stats/contributors`);
	const contributors = await res.json();

	const authors = contributors
		.sort((a, b) => b.total - a.total)
		.map(({ author }) => author);

	const sprite = new Jimp(SIZE * authors.length, SIZE);

	for (let i = 0; i < authors.length; i += 1) {
		const author = authors[i];
		console.log(`${i + 1} / ${authors.length}: ${author.login}`);

		const image_data = await fetch(author.avatar_url);
		const buffer = await image_data.arrayBuffer();

		const image = await Jimp.read(buffer);
		image.resize(SIZE, SIZE);

		sprite.composite(image, i * SIZE, 0);
	}

	await sprite.quality(80).write(`../static/contributors.jpg`);

	const str = `[\n\t${authors.map(a => `'${a.login}'`).join(',\n\t')}\n]`;

	fs.writeFileSync(`../src/routes/_contributors.js`, `export default ${str};`);
}

main();