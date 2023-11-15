import { test } from '../../test';

/** @type {string[]} */
let logs = [];

export default test({
	html: `
		<h1>tag is h1.</h1>
	`,
	get props() {
		return {
			/** @type {string | false} */
			tag: 'h1',
			/** @param {string} log */
			pushLogs(log) {
				logs.push(log);
			}
		};
	},
	after_test() {
		logs = [];
	},

	async test({ assert, component, target }) {
		assert.equal(component.tag, 'h1');

		assert.deepEqual(logs, ['create: h1,opt1']);
		component.opt = 'opt2';

		assert.equal(component.tag, 'h1');
		assert.deepEqual(logs, ['create: h1,opt1', 'update: h1,opt2']);

		component.tag = 'h2';

		assert.equal(component.tag, 'h2');
		assert.deepEqual(logs, ['create: h1,opt1', 'update: h1,opt2', 'destroy', 'create: h2,opt2']);
		assert.htmlEqual(target.innerHTML, '<h2>tag is h2.</h2>');

		component.tag = false;
		assert.deepEqual(logs, [
			'create: h1,opt1',
			'update: h1,opt2',
			'destroy',
			'create: h2,opt2',
			'destroy'
		]);

		assert.htmlEqual(target.innerHTML, '');
	}
});
