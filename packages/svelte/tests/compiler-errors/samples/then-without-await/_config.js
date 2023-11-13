import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-then-placement',
		message: 'Cannot have an {:then} block outside an {#await ...} block',
		position: [6, 6]
	}
});
