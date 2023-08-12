// @ts-check
import 'dotenv/config';
import Jimp from 'jimp';
import { stat, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const force = process.env.FORCE_UPDATE === 'true';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(__dirname);

// ../src/routes/_components/Supporters/contributors.js
const outputFile = new URL(`../src/routes/_components/Supporters/contributors.js`, import.meta.url);

try {
	if (!force && (await stat(outputFile))) {
		console.info(`[update/contributors] ${outputFile} exists. Skipping`);
		process.exit(0);
	}
} catch {
	const base = `https://api.github.com/repos/sveltejs/svelte/contributors`;
	const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

	const MAX = 24;
	const SIZE = 128;

	const contributors = [];
	let page = 1;

	while (true) {
		const res = await fetch(
			`${base}?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&per_page=100&page=${page++}`
		);
		const list = await res.json();

		if (!Array.isArray(list)) throw new Error('Expected an array');

		if (list.length === 0) break;

		contributors.push(...list);
	}

	const authors = contributors
		.filter(({ login }) => !login.includes('[bot]'))
		.sort((a, b) => b.contributions - a.contributions)
		.slice(0, MAX);

	const sprite = new Jimp(SIZE * authors.length, SIZE);

	for (let i = 0; i < authors.length; i += 1) {
		const author = authors[i];
		console.log(`${i + 1} / ${authors.length}: ${author.login}`);

		const image_data = await fetch(author.avatar_url);
		const buffer = await image_data.arrayBuffer();

		// @ts-ignore
		const image = await Jimp.read(buffer);
		image.resize(SIZE, SIZE);

		sprite.composite(image, i * SIZE, 0);
	}

	await sprite
		.quality(80)
		.writeAsync(
			new URL(`../src/routes/_components/Supporters/contributors.jpg`, import.meta.url).pathname
		);

	const str = `[\n\t${authors.map((a) => `'${a.login}'`).join(',\n\t')}\n]`;

	writeFile(outputFile, `export default ${str};`);
}
