import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-tag-name',
		message:
			'Valid <svelte:...> tag names are svelte:head, svelte:options, svelte:window, svelte:document, svelte:body, svelte:self, svelte:component, svelte:fragment or svelte:element',
		position: [10, 10]
	}
});
