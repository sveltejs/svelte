import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-elseif-placement',
		message: 'Expected to close <p> tag before seeing {:else if ...} block',
		position: [25, 25]
	}
});
