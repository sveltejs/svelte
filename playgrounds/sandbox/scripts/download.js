import fs from 'node:fs';

const arg = process.argv[2];

/** @type {URL} */
let url;

try {
	url = new URL(arg);
} catch (e) {
	console.error(`${arg} is not a URL`);
	process.exit(1);
}

if (url.origin !== 'https://svelte.dev' || !url.pathname.startsWith('/playground/')) {
	console.error(`${arg} is not a Svelte playground URL`);
	process.exit(1);
}

let files;

if (url.hash.length > 1) {
	const decoded = atob(url.hash.slice(1).replaceAll('-', '+').replaceAll('_', '/'));
	// putting it directly into the blob gives a corrupted file
	const u8 = new Uint8Array(decoded.length);
	for (let i = 0; i < decoded.length; i++) {
		u8[i] = decoded.charCodeAt(i);
	}
	const stream = new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'));
	const json = await new Response(stream).text();

	files = JSON.parse(json).files;
} else {
	const id = url.pathname.split('/')[2];
	const response = await fetch(`https://svelte.dev/playground/api/${id}.json`);

	files = (await response.json()).components.map((data) => {
		const basename = `${data.name}.${data.type}`;

		return {
			type: 'file',
			name: basename,
			basename,
			contents: data.source,
			text: true
		};
	});
}

for (const file of files) {
	fs.writeFileSync(`src/${file.name}`, file.contents);
}
