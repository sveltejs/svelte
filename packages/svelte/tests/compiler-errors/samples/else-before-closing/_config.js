import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-else-placement',
		message: 'Expected to close <li> tag before seeing {:else} block',
		position: [23, 23]
	}
});
