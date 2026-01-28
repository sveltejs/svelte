import { test } from '../../test';

export default test({
	// check that this is a runtime error, not a compile time error
	// caused by over-eager partial-evaluation
	error: 'Cannot convert invalid to a BigInt'
});
