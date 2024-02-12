import { test } from '../../test';

export default test({
	skip: true, // TODO: no source maps for binding in template
	client: [
		'potato',
		{ str: 'potato', idxOriginal: 1, idxGenerated: 3 },
		{ str: 'potato', idxOriginal: 1, idxGenerated: 5 }
	]
});
