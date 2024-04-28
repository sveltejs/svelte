import { test } from '../../test';

export default test({
	error: {
		code: 'store_invalid_scoped_subscription',
		message: 'Cannot subscribe to stores that are not declared at the top level of the component',
		position: [167, 172]
	}
});
