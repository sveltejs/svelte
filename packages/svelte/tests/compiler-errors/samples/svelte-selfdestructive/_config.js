import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-svelte-tag',
		message:
			'Valid <svelte:...> tag names are svelte:head, svelte:options, svelte:window, svelte:document, svelte:body, svelte:element, svelte:component, svelte:self or svelte:fragment',
		position: [10, 10]
	}
});
