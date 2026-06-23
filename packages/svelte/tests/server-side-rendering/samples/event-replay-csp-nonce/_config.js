import { test } from '../../test';

// With `csp.nonce`, the head script is emitted with `nonce="..."` and no hash needs to be returned to the framework.

export default test({
	csp: { nonce: 'abc123' },
	script_hashes: []
});
