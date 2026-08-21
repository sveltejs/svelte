import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	compileOptions: {
		dev: true
	},
	html: `
		<p>no parent</p>
		<button>toggle</button>
		<p>if</p>
		<p>each</p>
		<p>loading</p>
		<p>key</p>
		<p>hi</p>
		<p>hi</p>
		<p>hi</p>
		<p>hi</p>
		<p>hi</p>
	`,

	async test({ target, assert }) {
		function check() {
			const [main, if_, each, await_, key, child1, child2, child3, child4, dynamic] =
				target.querySelectorAll('p');

			// @ts-expect-error
			assert.deepEqual(main.__svelte_meta.parent, null);

			// @ts-expect-error
			assert.deepEqual(if_.__svelte_meta.parent, {
				file: 'main.svelte',
				type: 'if',
				line: 12,
				column: 0,
				parent: null
			});

			// @ts-expect-error
			assert.deepEqual(each.__svelte_meta.parent, {
				file: 'main.svelte',
				type: 'each',
				line: 16,
				column: 0,
				parent: null
			});

			// @ts-expect-error
			assert.deepEqual(await_.__svelte_meta.parent, {
				file: 'main.svelte',
				type: 'await',
				line: 20,
				column: 0,
				parent: null
			});

			// @ts-expect-error
			assert.deepEqual(key.__svelte_meta.parent, {
				file: 'main.svelte',
				type: 'key',
				line: 26,
				column: 0,
				parent: null
			});

			// @ts-expect-error
			assert.deepEqual(child1.__svelte_meta.parent, {
				file: 'main.svelte',
				type: 'component',
				componentTag: 'Child',
				line: 30,
				column: 0,
				parent: null
			});

			// @ts-expect-error
			assert.deepEqual(child2.__svelte_meta.parent, {
				file: 'main.svelte',
				type: 'component',
				componentTag: 'Child',
				line: 33,
				column: 1,
				parent: {
					file: 'passthrough.svelte',
					type: 'render',
					line: 5,
					column: 0,
					parent: {
						file: 'main.svelte',
						type: 'component',
						componentTag: 'Passthrough',
						line: 32,
						column: 0,
						parent: null
					}
				}
			});

			// @ts-expect-error
			assert.deepEqual(child3.__svelte_meta.parent, {
				file: 'main.svelte',
				type: 'component',
				componentTag: 'Child',
				line: 38,
				column: 2,
				parent: {
					file: 'passthrough.svelte',
					type: 'render',
					line: 5,
					column: 0,
					parent: {
						file: 'main.svelte',
						type: 'component',
						componentTag: 'Passthrough',
						line: 37,
						column: 1,
						parent: {
							file: 'passthrough.svelte',
							type: 'render',
							line: 5,
							column: 0,
							parent: {
								file: 'main.svelte',
								type: 'component',
								componentTag: 'Passthrough',
								line: 36,
								column: 0,
								parent: null
							}
						}
					}
				}
			});

			// @ts-expect-error
			assert.deepEqual(child4.__svelte_meta.parent, {
				file: 'passthrough.svelte',
				type: 'render',
				line: 8,
				column: 1,
				parent: {
					file: 'passthrough.svelte',
					type: 'if',
					line: 7,
					column: 0,
					parent: {
						file: 'main.svelte',
						type: 'component',
						componentTag: 'Passthrough',
						line: 43,
						column: 1,
						parent: {
							file: 'main.svelte',
							type: 'if',
							line: 42,
							column: 0,
							parent: null
						}
					}
				}
			});

			// @ts-expect-error
			assert.deepEqual(dynamic.__svelte_meta.parent, {
				file: 'main.svelte',
				type: 'component',
				componentTag: 'x.y',
				line: 50,
				column: 0,
				parent: null
			});
		}

		await tick();
		check();

		// Test that stack is kept when re-rendering
		const button = target.querySelector('button');
		button?.click();
		await tick();
		button?.click();
		await tick();
		check();
	}
});
