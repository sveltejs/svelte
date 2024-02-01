import { test } from '../../test';

export default test({
	// This is skipped for now, because it's not clear how to make this work on client-side initial run:
	// The anchor isn't connected to its parent at the time we can do a runtime check for the namespace, and we
	// need the parent for this check. (this didn't work in Svelte 4 either)
	skip: true,
	html: '<svg><path></path></svg>',

	test({ assert, target }) {
		const svg = target.querySelector('svg');
		const rect = target.querySelector('path');
		assert.equal(svg?.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(rect?.namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
