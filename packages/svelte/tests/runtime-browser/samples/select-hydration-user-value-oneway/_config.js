import { assert_ok, test } from '../../assert';

let hydrated = false;

const props = {
	untouched: 'a'
};

export default test({
	props,

	before_test() {
		// Client state still wins when the user has not changed the server selection.
		props.untouched = 'b';

		const single = document.querySelector('#single');
		if (!(single instanceof HTMLSelectElement)) return;
		hydrated = true;
		single.value = 'b';
		single.dispatchEvent(new Event('change', { bubbles: true }));
	},

	async test({ assert, component, target }) {
		// The unheard pre-hydration `change` is replayed on a microtask (the
		// handler is only registered after the template effect's first run).
		await Promise.resolve();

		assert.equal(component.value, hydrated ? 'b' : 'a');
		assert.equal(component.untouched, 'b');

		const single = target.querySelector('#single');
		assert_ok(single instanceof HTMLSelectElement);
		assert.equal(single.value, hydrated ? 'b' : 'a');
	}
});
