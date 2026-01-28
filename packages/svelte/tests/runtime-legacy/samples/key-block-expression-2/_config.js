import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<div>3</div>',
	test({ assert, component, target }) {
		const div = target.querySelector('div');

		component.mutate();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<div>5</div>');
		assert.strictEqual(div, target.querySelector('div'));

		component.reassign();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<div>7</div>');
		assert.strictEqual(div, target.querySelector('div'));

		component.changeKey();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<div>7</div>');
		assert.notStrictEqual(div, target.querySelector('div'));
	}
});
