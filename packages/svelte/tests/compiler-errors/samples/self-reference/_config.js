import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_self_placement',
		message:
			'`<svelte:self>` components can only exist inside {#if} blocks, {#each} blocks, {#snippet} blocks or slots passed to components',
		position: [1, 1]
	}
});
