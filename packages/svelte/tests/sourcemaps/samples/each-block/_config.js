import { test } from '../../test';

export default test({
	skip: true, // TODO no mapping for bar
	client: ['foo', 'bar', { str: 'bar', idxGenerated: 1, idxOriginal: 1 }]
});
