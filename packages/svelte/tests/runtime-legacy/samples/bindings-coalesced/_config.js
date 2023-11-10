import { test } from '../../test';

export default test({
	async test({ assert, component }) {
		const { foo, p } = component;

		/** @type {string[]} */
		const values = [];

		Object.defineProperty(p.childNodes[0], 'nodeValue', {
			set(value) {
				values.push(value);
			}
		});

		await foo.double();

		assert.deepEqual(values, ['6']);
	}
});
