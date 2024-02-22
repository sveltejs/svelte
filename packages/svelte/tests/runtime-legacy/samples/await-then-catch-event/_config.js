import { tick } from 'svelte';
import { test } from '../../test';
import { create_deferred } from '../../../helpers.js';

/** @type {ReturnType<typeof create_deferred>} */
let deferred;

export default test({
	before_test() {
		deferred = create_deferred();
	},
	get props() {
		return {
			thePromise: deferred.promise
		};
	},

	html: `
		<p>loading...</p>
	`,

	test({ assert, component, target, window }) {
		deferred.resolve(42);

		return deferred.promise
			.then(async () => {
				await tick();
				assert.htmlEqual(target.innerHTML, '<button>click me</button>');

				const { button } = component;

				const click = new window.Event('click', { bubbles: true });
				button.dispatchEvent(click);

				assert.equal(component.clicked, 42);

				const thePromise = Promise.resolve(43);
				component.thePromise = thePromise;

				return thePromise;
			})
			.then(() => {
				const { button } = component;

				const click = new window.Event('click', { bubbles: true });
				button.dispatchEvent(click);

				assert.equal(component.clicked, 43);
			});
	}
});
