import { test } from '../../test';

export default test({
	get props() {
		return { props: { a: 1 } };
	},

	html: '',

	test({ assert, component, target }) {
		component.props = {
			a: 2
		};

		assert.htmlEqual(target.innerHTML, '');
	}
});
