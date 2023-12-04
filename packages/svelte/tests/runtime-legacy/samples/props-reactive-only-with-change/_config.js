import { test } from '../../test';

/** @type {string[]} */
let callbacks = [];

export default test({
	get props() {
		return {
			/** @param {string} value */
			callback: (value) => callbacks.push(value),
			val1: '1',
			val2: '2'
		};
	},

	before_test() {
		callbacks = [];
	},

	async test({ assert, component }) {
		assert.equal(callbacks.length, 2);
		assert.equal(JSON.stringify(callbacks), '["1","2"]');

		component.val1 = '3';
		assert.equal(callbacks.length, 3);
		assert.equal(JSON.stringify(callbacks), '["1","2","1"]');

		component.val1 = '4';
		assert.equal(callbacks.length, 4);
		assert.equal(JSON.stringify(callbacks), '["1","2","1","1"]');

		component.val2 = '5';
		assert.equal(callbacks.length, 5);
		assert.equal(JSON.stringify(callbacks), '["1","2","1","1","2"]');
	}
});
