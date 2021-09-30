require('dotenv/config');
const fs = require('fs');
const fetch = require('node-fetch');
const Jimp = require('jimp');

const force = process.env.FORCE_UPDATE === 'true';

process.chdir(__dirname);

const outputFile = `../src/routes/_contributors.js`;
if (!force && fs.existsSync(outputFile)) {
	console.info(`[update/contributors] ${outputFile} exists. Skipping`);
	process.exit(0);
}

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
		.filter(({ login }) => !login.includes('[bot]'))
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
	// TODO: Optimizing the static/contributors.jpg image should probably get automated as well
	console.log('remember to additionally optimize the resulting /static/contributors.jpg image file via e.g. https://squoosh.app ');

	const str = `[\n\t${authors.map(a => `'${a.login}'`).join(',\n\t')}\n]`;

	fs.writeFileSync(outputFile, `export default ${str};`);
}

main();
