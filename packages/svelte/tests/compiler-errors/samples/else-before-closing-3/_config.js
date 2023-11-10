import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-else-placement',
		message: 'Cannot have an {:else} block outside an {#if ...} or {#each ...} block',
		position: [11, 11]
	}
});
