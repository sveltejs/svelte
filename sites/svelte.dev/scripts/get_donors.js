// @ts-check
import 'dotenv/config';
import Jimp from 'jimp';
import { stat, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const force = process.env.FORCE_UPDATE === 'true';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(__dirname);

const outputFile = new URL(`../src/routes/_components/Supporters/donors.js`, import.meta.url);

try {
	if (!force && (await stat(outputFile))) {
		console.info(`[update/donors] ${outputFile} exists. Skipping`);
		process.exit(0);
	}
} catch {
	const MAX = 24;
	const SIZE = 128;

	const res = await fetch('https://opencollective.com/svelte/members/all.json');
	const donors = await res.json();

	if (!Array.isArray(donors)) throw new Error('Expected an array');

	const unique = new Map();
	donors.forEach((d) => unique.set(d.profile, d));

	let backers = [...unique.values()]
		.filter(({ role }) => role === 'BACKER')
		.sort((a, b) => b.totalAmountDonated - a.totalAmountDonated)
		.slice(0, 3 * MAX);

	const included = [];
	for (let i = 0; included.length < MAX; i += 1) {
		const backer = backers[i];
		console.log(`${included.length + 1} / ${MAX}: ${backer.name}`);

		try {
			const image_data = await fetch(backer.image);
			const buffer = await image_data.arrayBuffer();
			// @ts-ignore
			const image = await Jimp.read(buffer);
			image.resize(SIZE, SIZE);
			included.push({ backer, image });
		} catch (err) {
			console.log(`Skipping ${backer.name}: no image data`);
		}
	}

	const sprite = new Jimp(SIZE * included.length, SIZE);
	for (let i = 0; i < included.length; i += 1) {
		sprite.composite(included[i].image, i * SIZE, 0);
	}

	await sprite
		.quality(80)
		.writeAsync(
			fileURLToPath(new URL(`../src/routes/_components/Supporters/donors.jpg`, import.meta.url))
		);

	const str = `[\n\t${included.map((a) => `${JSON.stringify(a.backer.name)}`).join(',\n\t')}\n]`;

	writeFile(outputFile, `export default ${str};`);
}
