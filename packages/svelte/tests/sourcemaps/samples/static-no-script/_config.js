import { test } from '../../test';

export default test({
	test({ assert, map_client }) {
		assert.deepEqual(map_client.sources, ['../../input.svelte']);
		// TODO do we need to set sourcesContent? We did it in Svelte 4, but why?
		// assert.deepEqual(js.map.sourcesContent, [
		// 	fs.readFileSync(path.join(__dirname, 'input.svelte'), 'utf-8')
		// ]);
	}
});
