import { test } from '../../test';

export default test({
	compileOptions: {
		// override process.env.HMR — this test only passes in prod mode because in dev mode we generate a helpful error
		dev: false
	},

	get props() {
		return { componentName: 'Sub' };
	},
	html: '<div>Sub</div>',
	test({ assert, component, target }) {
		component.componentName = 'Proxy';
		assert.htmlEqual(target.innerHTML, '<div>Sub</div>');
		try {
			component.componentName = 'banana';
			throw new Error('Expected an error');
		} catch (err) {
			assert.include(/** @type {Error} */ (err).message, '$$component is not a function');
		}
	}
});
