import { test } from '../../test';

export default test({
	get props() {
		return {
			raw: '<span><em>raw html!!!\\o/</span></em>'
		};
	},

	html: 'before<span><em>raw html!!!\\o/</span></em>after',

	test({ assert, component, target }) {
		component.raw = '';
		assert.htmlEqual(target.innerHTML, 'beforeafter');
		component.raw = 'how about <strong>unclosed elements?';
		assert.htmlEqual(target.innerHTML, 'beforehow about <strong>unclosed elements?</strong>after');
	}
});
