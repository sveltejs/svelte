import { test } from '../../test';

export default test({
	mode: ['async'],
	csp: { hash: true, nonce: 'test-nonce' },
	script_hashes: []
});
