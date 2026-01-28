import { test } from '../../test';

export default test({
	error: {
		code: 'svelte_self_invalid_placement',
		message:
			'`<svelte:self>` components can only exist inside `{#if}` blocks, `{#each}` blocks, `{#snippet}` blocks or slots passed to components',
		position: [0, 14]
	}
});
