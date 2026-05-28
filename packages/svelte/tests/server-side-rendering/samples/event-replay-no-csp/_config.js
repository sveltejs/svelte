import { test } from '../../test';

// with no `csp`, inline attrs emitted as before. `html_equal` strips them, so we use `withoutNormalizeHtml` to assert the literal output

export default test({
	withoutNormalizeHtml: true,
	script_hashes: []
});
