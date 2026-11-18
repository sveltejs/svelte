import { flushSync } from 'svelte';
import { batchId, label, listen } from 'svelte/internal/devtools';
import { async_mode } from '../../../helpers.js';
import { test } from '../../test';

/** @type {string[]} */
let log = [];

/** @type {Map<number, string>} */
const names = new Map();

/** @param {any} batch */
function name(batch) {
	const id = batchId(batch);
	if (!names.has(id)) names.set(id, `B${names.size + 1}`);
	return names.get(id);
}

/** @type {() => void} */
let unlisten;

export default test({
	mode: ['client'],
	compileOptions: { dev: true },

	before_test() {
		log = [];
		names.clear();

		unlisten = listen({
			name: 'test',
			flushStart(batch) {
				log.push(`flushStart ${name(batch)}`);
			},
			flushEnd(batch) {
				log.push(`flushEnd ${name(batch)}`);
			},
			signalWritten(signal, { batch }) {
				log.push(`write ${label(signal)} ${name(batch)}`);
			},
			batchCommitted(batch) {
				log.push(`committed ${name(batch)}`);
			}
		});
	},

	after_test() {
		unlisten();
	},

	test({ assert, target }) {
		flushSync();
		log = [];
		names.clear();

		// a write made by an effect goes to a new batch, processed inside the same flush
		const [a, c] = target.querySelectorAll('button');
		flushSync(() => a.click());

		assert.deepEqual(log, [
			'write a B1',
			'flushStart B1',
			'write b B2',
			'committed B1',
			'committed B2',
			'flushEnd B1'
		]);

		// `flushSync` inside an effect nests a flush of the new batch. In async mode its commit
		// rebases the outer batch, which then ends inside the nested flush. Without async mode
		// there is no rebase, so the outer batch ends after the nested flush
		log = [];
		names.clear();
		flushSync(() => c.click());

		assert.deepEqual(
			log,
			async_mode
				? [
						'write c B1',
						'flushStart B1',
						'write b B2',
						'flushStart B2',
						'committed B2',
						'committed B1',
						'flushEnd B2',
						'flushEnd B1'
					]
				: [
						'write c B1',
						'flushStart B1',
						'write b B2',
						'flushStart B2',
						'committed B2',
						'flushEnd B2',
						'committed B1',
						'flushEnd B1'
					]
		);
	}
});
