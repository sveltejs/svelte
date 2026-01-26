import fs from 'node:fs';

/**
 * Detects if a file is text or binary by checking for null bytes
 * and validating UTF-8 encoding
 * @param {string} filepath - Path to the file
 * @returns {boolean} - true if file is text, false if binary
 */
function isTextFile(filepath) {
	const buffer = fs.readFileSync(filepath);
	// Check for null bytes which indicate binary files
	for (let i = 0; i < buffer.length; i++) {
		if (buffer[i] === 0) {
			return false;
		}
	}
	// Validate UTF-8 encoding
	try {
		const text = buffer.toString('utf-8');
		// Verify round-trip encoding to ensure valid UTF-8
		const encoded = Buffer.from(text, 'utf-8');
		return buffer.equals(encoded);
	} catch {
		return false;
	}
}

const files = [];

for (const basename of fs.readdirSync('src')) {
	if (fs.statSync(`src/${basename}`).isDirectory()) continue;

	const filepath = `src/${basename}`;
	const isText = isTextFile(filepath);

	files.push({
		type: 'file',
		name: basename,
		basename,
		contents: isText ? fs.readFileSync(filepath, 'utf-8') : fs.readFileSync(filepath).toString('base64'),
		text: isText
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
