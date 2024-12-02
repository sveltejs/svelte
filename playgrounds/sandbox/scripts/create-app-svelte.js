import fs from 'node:fs';

const destination = new URL('../src/main.svelte', import.meta.url);

if (!fs.existsSync(destination)) {
	const template = new URL('./main.template.svelte', import.meta.url);

	try {
		fs.mkdirSync(new URL('../src', import.meta.url));
	} catch {}

	fs.writeFileSync(destination, fs.readFileSync(template, 'utf-8'), 'utf-8');
}
