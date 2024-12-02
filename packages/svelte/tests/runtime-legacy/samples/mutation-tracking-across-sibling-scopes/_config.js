import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, component, target }) {
		assert.htmlEqual(component.div.innerHTML, '<div>+</div><div>-</div>');

		const event = new window.Event('change');
		const input = target.querySelector('input');
		ok(input);

		input.checked = false;
		input.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(component.div.innerHTML, '<div>-</div><div>-</div>');
	}
});
