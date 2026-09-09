import { test } from '../../test';

// A tag whose expression ends with a bare `/` at the end of the input used to
// make `find_matching_bracket` loop forever; it should error instead of hanging.
export default test({
	error: {
		code: 'unexpected_eof',
		message: 'Unexpected end of input',
		position: [12, 12]
	}
});
