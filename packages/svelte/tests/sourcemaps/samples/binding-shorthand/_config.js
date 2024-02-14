import { test } from '../../test';

export default test({
	skip: true, // No source map for binding in template because there's no loc property for it; skipped in Svelte 4, too
	client: [
		'potato',
		{ str: 'potato', idxOriginal: 1, idxGenerated: 3 },
		{ str: 'potato', idxOriginal: 1, idxGenerated: 5 }
	]
});
