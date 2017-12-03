import assert from 'assert';
import {svelte} from '../helpers.js';

describe.only('preprocess', () => {
	it('preprocesses entire component', () => {
		const source = `
			<h1>Hello __NAME__!</h1>
		`;

		const expected = `
			<h1>Hello world!</h1>
		`;

		return svelte.preprocess(source, {
			markup: ({ content }) => {
				return {
					code: content.replace('__NAME__', 'world')
				};
			}
		}).then(processed => {
			assert.equal(processed.toString(), expected);
		});
	});

	it('preprocesses style', () => {
		const source = `
			<div class='brand-color'>$brand</div>

			<style>
				.brand-color {
					color: $brand;
				}
			</style>
		`;

		const expected = `
			<div class='brand-color'>$brand</div>

			<style>
				.brand-color {
					color: purple;
				}
			</style>
		`;

		return svelte.preprocess(source, {
			style: ({ content }) => {
				return {
					code: content.replace('$brand', 'purple')
				};
			}
		}).then(processed => {
			assert.equal(processed.toString(), expected);
		});
	});

	it('preprocesses style asynchronously', () => {
		const source = `
			<div class='brand-color'>$brand</div>

			<style>
				.brand-color {
					color: $brand;
				}
			</style>
		`;

		const expected = `
			<div class='brand-color'>$brand</div>

			<style>
				.brand-color {
					color: purple;
				}
			</style>
		`;

		return svelte.preprocess(source, {
			style: ({ content }) => {
				return Promise.resolve({
					code: content.replace('$brand', 'purple')
				});
			}
		}).then(processed => {
			assert.equal(processed.toString(), expected);
		});
	});

	it('preprocesses script', () => {
		const source = `
			<script>
				console.log(__THE_ANSWER__);
			</script>
		`;

		const expected = `
			<script>
				console.log(42);
			</script>
		`;

		return svelte.preprocess(source, {
			script: ({ content }) => {
				return {
					code: content.replace('__THE_ANSWER__', '42')
				};
			}
		}).then(processed => {
			assert.equal(processed.toString(), expected);
		});
	});

	it('parses attributes', () => {
		const source = `
			<style type='text/scss' bool></style>
		`;

		return svelte.preprocess(source, {
			style: ({ attributes }) => {
				assert.deepEqual(attributes, {
					type: 'text/scss',
					bool: true
				});
			}
		});
	});

	it('ignores null/undefined returned from preprocessor', () => {
		const source = `
			<script>
				console.log('ignore me');
			</script>
		`;

		const expected = `
			<script>
				console.log('ignore me');
			</script>
		`;

		return svelte.preprocess(source, {
			script: () => null
		}).then(processed => {
			assert.equal(processed.toString(), expected);
		});
	});
});