import { kind, listen, location } from 'svelte/internal/devtools';
import { test } from '../../test';

/** @type {Array<string | undefined>} */
const locations = [];

/** @type {() => void} */
let unlisten;

export default test({
	mode: ['client'],
	compileOptions: { dev: true },

	before_test() {
		locations.length = 0;

		unlisten = listen({
			name: 'test',
			effectCreated(effect) {
				if (kind(effect) === 'effect') locations.push(location(effect));
			}
		});
	},

	after_test() {
		unlisten();
	},

	test({ assert }) {
		// deferred effects sharing a callback keep their own locations
		assert.deepEqual(locations, ['main.svelte:4:1', 'main.svelte:5:1']);
	}
});
