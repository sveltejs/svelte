import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<p>42</p>
		<p>42</p>
	`,

	test({ assert, component, target }) {
		component.updateStore(undefined);
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p></p><p>42</p>');

		component.updateStore(33);
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p>33</p><p>42</p>');

		component.updateStore(undefined);
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p></p><p>42</p>');

		component.updateVar(undefined);
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p></p><p></p>');

		component.updateVar(33);
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p></p><p>33</p>');

		component.updateVar(undefined);
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p></p><p></p>');
	}
});
