import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	get props() {
		return { foo: 'foo' };
	},
	html: '<div>foo @ foo # foo</div>'
});
