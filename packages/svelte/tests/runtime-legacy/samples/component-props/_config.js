import { test } from '../../test';

export default test({
	accessors: false,
	html: '',
	async test({ assert, target, component }) {
		component.$set({
			foo: 'bar',
			visible: true
		});
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, '{"foo":"bar","visible":true} {"foo":"bar"}');
	}
});
