import { test } from '../../test';

// test itself might look weird, but it tests that the compilation output doesn't contain a dangling `export;` due to false hoisting
export default test({
	html: '<p>(42)(99)</p>'
});
