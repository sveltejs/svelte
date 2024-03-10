import { test } from '../../test';

export default test({
	error: {
		code: 'illegal-store-subscription',
		message: 'Cannot subscribe to stores that are not declared at the top level of the component'
	}
});
