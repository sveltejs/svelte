const fs = require('fs');
const path = require('path');

export function test({ assert, js }) {
	assert.deepEqual(js.map.sources, ['input.svelte']);
	assert.deepEqual(js.map.sourcesContent, [
		fs.readFileSync(path.join(__dirname, 'input.svelte'), 'utf-8')
	]);
}
