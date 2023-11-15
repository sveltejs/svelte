import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-elseif-placement',
		message: 'Expected to close {#await} block before seeing {:else if ...} block',
		position: [34, 34]
	}
});
