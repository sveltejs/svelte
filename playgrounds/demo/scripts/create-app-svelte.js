import fs from 'node:fs';
const destination = new URL('../src/App.svelte', import.meta.url);
if (!fs.existsSync(destination)) {
	const template = new URL('./App.template.svelte', import.meta.url);
	fs.writeFileSync(destination, fs.readFileSync(template, 'utf-8'), 'utf-8');
}
