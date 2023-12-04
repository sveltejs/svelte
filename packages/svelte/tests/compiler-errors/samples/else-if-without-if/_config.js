import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-elseif-placement',
		message: 'Cannot have an {:else if ...} block outside an {#if ...} block',
		position: [35, 35]
	}
});
