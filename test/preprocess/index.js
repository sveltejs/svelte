import * as assert from 'assert';
import { svelte } from '../helpers.js';

describe('preprocess', () => {
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

	it('preprocesses multiple matching tags', () => {
		const source = `
			<script>
				REPLACEME
			</script>
			<style>
				SHOULD NOT BE REPLACED
			</style>
			<script>
				REPLACEMETOO
			</script>
		`;

		const expected = `
			<script>
				replaceme
			</script>
			<style>
				SHOULD NOT BE REPLACED
			</style>
			<script>
				replacemetoo
			</script>
		`;

		return svelte.preprocess(source, {
			script: ({ content }) => {
				return {
					code: content.toLowerCase()
				};
			}
		}).then(processed => {
			assert.equal(processed.toString(), expected);
		});
	});

	it('parses attributes', () => {
		const source = `
			<style type='text/scss' data-foo="bar" bool></style>
		`;

		const expected = `
			<style type='text/scss' data-foo="bar" bool>PROCESSED</style>
		`;

		return svelte.preprocess(source, {
			style: ({ attributes }) => {
				assert.deepEqual(attributes, {
					type: 'text/scss',
					'data-foo': 'bar',
					bool: true
				});
				return { code: 'PROCESSED' };
			}
		}).then(processed => {
			assert.equal(processed.toString(), expected);
		});
	});

	it('provides filename to processing hooks', () => {
		const source = `
			<h1>Hello __MARKUP_FILENAME__!</h1>
			<style>.red { color: __STYLE_FILENAME__; }</style>
			<script>console.log('__SCRIPT_FILENAME__');</script>
		`;

		const expected = `
			<h1>Hello file.html!</h1>
			<style>.red { color: file.html; }</style>
			<script>console.log('file.html');</script>
		`;

		return svelte.preprocess(source, {
			filename: 'file.html',
			markup: ({ content, filename }) => {
				return {
					code: content.replace('__MARKUP_FILENAME__', filename)
				};
			},
			style: ({ content, filename }) => {
				return {
					code: content.replace('__STYLE_FILENAME__', filename)
				};
			},
			script: ({ content, filename }) => {
				return {
					code: content.replace('__SCRIPT_FILENAME__', filename)
				};
			}
		}).then(processed => {
			assert.equal(processed.toString(), expected);
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
