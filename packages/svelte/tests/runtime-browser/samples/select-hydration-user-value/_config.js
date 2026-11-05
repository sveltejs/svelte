import { flushSync, tick } from 'svelte';
import { assert_ok, test } from '../../assert';

let hydrated = false;

const props = {
	untouched: 'a',
	unselected: /** @type {string | undefined} */ (undefined)
};

export default test({
	props,

	before_test() {
		// Client state still wins when the user has not changed the server selection.
		props.untouched = 'b';
		props.unselected = 'c';

		const single = document.querySelector('#single');
		if (!(single instanceof HTMLSelectElement)) return;
		hydrated = true;
		single.value = 'b';

		const number = document.querySelector('#number');
		assert_ok(number instanceof HTMLSelectElement);
		number.value = '2';

		const multiple = document.querySelector('#multiple');
		assert_ok(multiple instanceof HTMLSelectElement);
		for (const option of multiple.options) {
			option.selected = option.value !== 'a';
		}

		const cleared = document.querySelector('#cleared');
		assert_ok(cleared instanceof HTMLSelectElement);
		for (const option of cleared.options) option.selected = false;

		const object = document.querySelector('#object');
		assert_ok(object instanceof HTMLSelectElement);
		object.selectedIndex = 1;
	},

	async test({ assert, component, target }) {
		assert.deepEqual(
			[component.value, component.number, component.values],
			hydrated ? ['b', 2, ['b', 'c']] : ['a', 1, ['a']]
		);
		assert.equal(component.untouched, 'b');
		assert.equal(component.unselected, 'c');
		assert.deepEqual(component.cleared, hydrated ? [] : ['a']);
		assert.equal(component.object, component.objects[hydrated ? 1 : 0]);

		const single = target.querySelector('#single');
		assert_ok(single instanceof HTMLSelectElement);
		assert.equal(single.value, hydrated ? 'b' : 'a');

		flushSync(() => {
			component.value = 'c';
		});
		assert.equal(single.value, 'c');

		if (hydrated) {
			const form = target.querySelector('form');
			assert_ok(form);
			form.reset();
			await tick();
			assert.deepEqual([component.value, component.number, component.values], ['a', 1, ['a']]);
		}
	}
});
