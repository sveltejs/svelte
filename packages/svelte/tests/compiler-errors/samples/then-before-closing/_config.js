import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-then-placement',
		message: 'Expected to close <li> tag before seeing {:then} block',
		position: [26, 26]
	}
});
