require('dotenv/config');
const fs = require('fs');
const fetch = require('node-fetch');
const Jimp = require('jimp');

process.chdir(__dirname);

const base = `https://api.github.com/repos/sveltejs/svelte/contributors`;
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

const SIZE = 64;

async function main() {
	const contributors = [];
	let page = 1;

	while (true) {
		const res = await fetch(`${base}?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&per_page=100&page=${page++}`);
		const list = await res.json();

		if (list.length === 0) break;

		contributors.push(...list);
	}

	const authors = contributors
		.sort((a, b) => b.contributions - a.contributions);

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
	console.log('remember to additionally optimize the resulting /static/contributors.jpg image file via e.g. https://squoosh.app ');

	const str = `[\n\t${authors.map(a => `'${a.login}'`).join(',\n\t')}\n]`;

	fs.writeFileSync(`../src/routes/_contributors.js`, `export default ${str};`);
}

main();