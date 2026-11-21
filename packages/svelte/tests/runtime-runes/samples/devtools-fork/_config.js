import { flushSync, tick } from 'svelte';
import { batchId, isFork, label, listen, signalValue } from 'svelte/internal/devtools';
import { test } from '../../test';

/** @type {string[]} */
let log = [];

/** @type {Set<number>} */
const forks = new Set();

/** @type {() => void} */
let unlisten;

export default test({
	mode: ['client'],
	skip_no_async: true,
	compileOptions: { dev: true },

	before_test() {
		log = [];
		forks.clear();

		unlisten = listen({
			name: 'test',
			signalWritten(signal, { old, value: new_value, batch }) {
				if (label(signal) !== 'count') return;
				if (isFork(batch)) forks.add(batchId(batch));
				log.push(
					`write ${old} -> ${new_value} (fork: ${isFork(batch)}, committed value: ${signalValue(signal)})`
				);
			},
			batchCommitted(batch) {
				if (forks.has(batchId(batch))) log.push('fork committed');
			},
			batchDiscarded(batch) {
				if (forks.has(batchId(batch))) log.push('fork discarded');
			}
		});
	},

	after_test() {
		unlisten();
	},

	async test({ assert, target }) {
		const [fork, commit, discard] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		flushSync(() => fork.click());
		assert.htmlEqual(output.innerHTML, '0');

		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '1');

		flushSync(() => fork.click());
		flushSync(() => discard.click());
		assert.htmlEqual(output.innerHTML, '1');

		assert.deepEqual(log, [
			'write 0 -> 1 (fork: true, committed value: 0)',
			'fork committed',
			'write 1 -> 2 (fork: true, committed value: 1)',
			'fork discarded'
		]);
	}
});
