import { flushSync } from 'svelte';
import {
	batchId,
	isUninitialized,
	kind,
	label,
	listen,
	location,
	signalValue,
	snapshot
} from 'svelte/internal/devtools';
import { test } from '../../test';

/** @type {any[]} */
const created = [];

/** @type {any[]} */
const written = [];

/** @type {Array<{ proxy: any }>} */
const proxies = [];

/** @type {() => void} */
let unlisten;

export default test({
	mode: ['client'],
	compileOptions: { dev: true },

	before_test() {
		created.length = written.length = proxies.length = 0;

		unlisten = listen({
			name: 'test',
			signalCreated(signal, info) {
				// ignore template expressions and other internal deriveds
				if (!info.location) return;

				created.push({
					kind: info.kind,
					label: info.label,
					location: info.location,
					key: info.key,
					has_ctx: info.ctx !== null,
					uninitialized: isUninitialized(signal)
				});

				if (info.kind === 'proxy-version') proxies.push({ proxy: info.proxy });

				// helpers agree with the payload
				if (info.kind === 'state' || info.kind === 'derived') {
					if (kind(signal) !== info.kind) throw new Error('kind mismatch');
					if (location(signal) !== info.location) throw new Error('location mismatch');
				}
			},
			signalWritten(signal, info) {
				written.push({
					label: label(signal),
					old: info.old,
					value: info.value,
					committed: signalValue(signal),
					batch: typeof batchId(info.batch)
				});
			}
		});
	},

	after_test() {
		unlisten();
	},

	test({ assert, target }) {
		assert.deepEqual(created, [
			{
				kind: 'state',
				label: 'count',
				location: 'main.svelte:2:5',
				key: undefined,
				has_ctx: true,
				uninitialized: false
			},
			{
				kind: 'derived',
				label: 'doubled',
				location: 'main.svelte:3:5',
				key: undefined,
				has_ctx: true,
				uninitialized: true
			},
			{
				kind: 'proxy-version',
				label: 'todo version',
				location: 'main.svelte:4:7',
				key: undefined,
				has_ctx: true,
				uninitialized: false
			},
			{
				kind: 'proxy-prop',
				label: 'todo.text',
				location: 'main.svelte:4:7',
				key: 'text',
				has_ctx: true,
				uninitialized: false
			}
		]);

		// snapshot reads the proxy without traps
		assert.deepEqual(snapshot(proxies[0].proxy), { text: 'a' });

		const [increment, edit] = target.querySelectorAll('button');

		flushSync(() => increment.click());
		flushSync(() => edit.click());

		assert.deepEqual(written, [
			{ label: 'count', old: 0, value: 1, committed: 1, batch: 'number' },
			{ label: 'todo.text', old: 'a', value: 'a!', committed: 'a!', batch: 'number' }
		]);

		assert.deepEqual(snapshot(proxies[0].proxy), { text: 'a!' });
		assert.htmlEqual(target.querySelector('p')?.innerHTML ?? '', '1 2 a!');
	}
});
