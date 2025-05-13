import fs from 'node:fs';

const files = [];

for (const basename of fs.readdirSync('src')) {
	if (fs.statSync(`src/${basename}`).isDirectory()) continue;

	files.push({
		type: 'file',
		name: basename,
		basename,
		contents: fs.readFileSync(`src/${basename}`, 'utf-8'),
		text: true // TODO might not be
	});
}

const payload = JSON.stringify({
	name: 'sandbox',
	files
});

async function compress(payload) {
	const reader = new Blob([payload])
		.stream()
		.pipeThrough(new CompressionStream('gzip'))
		.getReader();

	let buffer = '';
	for (;;) {
		const { done, value } = await reader.read();

		if (done) {
			reader.releaseLock();
			return btoa(buffer).replaceAll('+', '-').replaceAll('/', '_');
		} else {
			for (let i = 0; i < value.length; i++) {
				// decoding as utf-8 will make btoa reject the string
				buffer += String.fromCharCode(value[i]);
			}
		}
	}
}

const hash = await compress(payload);
console.log(`https://svelte.dev/playground/untitled#${hash}`);
