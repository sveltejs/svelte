import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

export default test({
	// the app root is a custom renderer, so `mount` installs no delegated listeners,
	// and the DOM container for the child is not in the document
	html: '<custom><dom-host><button>0</button></dom-host></custom>',
	test({ assert, target, serialize }) {
		const container = target.children[0].children[0].dom;
		const button = container.querySelector('button');

		button.click();
		flushSync();

		assert.equal(serialize(target), '<custom><dom-host><button>1</button></dom-host></custom>');

		// if the renderer puts the container in the document, the event reaches both the
		// container and the `document` listener, but must only be handled once
		document.body.append(container);

		try {
			button.click();
			flushSync();

			assert.equal(serialize(target), '<custom><dom-host><button>2</button></dom-host></custom>');
		} finally {
			container.remove();
		}
	}
});
