const fs = require('node:fs');
const path = require('node:path');

export function test({ assert, js }) {
	assert.deepEqual(js.map.sources, ['input.svelte']);
	assert.deepEqual(js.map.sourcesContent, [
		fs.readFileSync(path.join(__dirname, 'input.svelte'), 'utf-8')
	]);
}
