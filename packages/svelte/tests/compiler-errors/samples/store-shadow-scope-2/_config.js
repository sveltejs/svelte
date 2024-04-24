import { test } from '../../test';

export default test({
	error: {
		code: 'illegal_store_subscription',
		message: 'Cannot subscribe to stores that are not declared at the top level of the component',
		position: [142, 147]
	}
});
