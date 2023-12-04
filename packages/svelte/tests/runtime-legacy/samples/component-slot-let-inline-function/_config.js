import { ok, test } from '../../test';

/** @type {string[]} */
let logs;

/** @param {string} value */
function log(value) {
	logs.push(value);
}

export default test({
	html: '<button>click me</button>',
	get props() {
		return { a: 'a', b: 'b', log };
	},
	before_test() {
		logs = [];
	},
	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		await button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

		assert.deepEqual(logs, ['a: a, b: b']);

		component.a = '1';
		component.b = '2';
		await button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		assert.deepEqual(logs, ['a: a, b: b', 'a: 1, b: 2']);
	}
});
