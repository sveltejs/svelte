import { ok, test } from '../../test';

/** @type {string[]} */
let logs;

/** @param {string} value */
function log(value) {
	logs.push(value);
}

export default test({
	get props() {
		return { prop: 'a', log };
	},
	html: '<button></button>',
	before_test() {
		logs = [];
	},
	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		await button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

		assert.deepEqual(logs, ['a']);

		component.prop = 'b';
		await button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		assert.deepEqual(logs, ['a', 'b']);
	}
});
