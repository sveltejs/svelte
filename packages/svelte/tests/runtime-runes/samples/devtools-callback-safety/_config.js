import { flushSync } from 'svelte';
import { get } from 'svelte/internal/client';
import { deps, label, listen } from 'svelte/internal/devtools';
import { test } from '../../test';

/** @type {string[]} */
const log = [];

/** @type {any} */
let other_signal = null;

/** @type {Set<any>} */
const reactions = new Set();

/** @type {null | (() => void)} */
let bump_other = null;

/** @type {Array<() => void>} */
let unlisteners = [];

export default test({
	mode: ['client'],
	compileOptions: { dev: true },

	before_test() {
		log.length = 0;
		reactions.clear();
		bump_other = null;

		unlisteners = [
			listen({
				name: 'thrower',
				signalWritten() {
					log.push('thrower');
					throw new Error('oops');
				}
			}),
			listen({
				name: 'writer',
				signalCreated(signal, info) {
					if (info.label === 'other') other_signal = signal;
				},
				signalWritten(signal) {
					log.push('writer');
					// writing state inside a callback is forbidden
					if (label(signal) === 'count') bump_other?.();
				}
			}),
			listen({
				name: 'reader',
				signalWritten() {
					log.push('reader (replaced)');
				}
			}),
			// same name: replaces the previous plugin in place
			listen({
				name: 'reader',
				reactionRunStart(reaction) {
					reactions.add(reaction);
					// a tracked read inside a callback must not become a dependency
					if (other_signal) get(other_signal);
				},
				signalWritten() {
					log.push('reader');
				}
			})
		];
	},

	after_test() {
		for (const unlisten of unlisteners) unlisten();
	},

	test({ assert, target, errors, instance }) {
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		bump_other = instance.bump_other;

		flushSync(() => button.click());

		assert.htmlEqual(output.innerHTML, '1');

		// the write inside the callback was rejected
		assert.equal(instance.read_other(), 0);

		// plugins run in subscription order; a throwing plugin doesn't stop the others
		assert.deepEqual(log, ['thrower', 'writer', 'reader']);

		assert.equal(errors[0], '[svelte] devtools plugin "thrower" threw in `signalWritten`');
		assert.equal(/** @type {Error} */ (errors[1]).message, 'oops');
		assert.equal(errors[2], '[svelte] devtools plugin "writer" threw in `signalWritten`');
		assert.match(
			/** @type {Error} */ (errors[3]).message,
			/must not write state inside their callbacks/
		);
		errors.length = 0;

		assert.ok(reactions.size > 0);
		for (const reaction of reactions) {
			assert.notInclude(deps(reaction), other_signal);
		}
	}
});
