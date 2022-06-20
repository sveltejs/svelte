export default {
	html: '',

	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, 'NaN');
	}
};
