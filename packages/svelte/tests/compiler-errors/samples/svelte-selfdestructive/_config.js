import { test } from '../../test';

export default test({
	error: {
		code: 'svelte_meta_invalid_tag',
		message:
			'Valid `<svelte:...>` tag names are svelte:head, svelte:options, svelte:window, svelte:document, svelte:body, svelte:element, svelte:component, svelte:self or svelte:fragment',
		position: [10, 32]
	}
});
