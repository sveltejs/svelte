export default {
	skip_if_ssr: true, // DOM and SSR output is different, a separate SSR test exists
	html: '<input form="qux" list="quu" />',

	test({ assert, target }) {
		const div = target.querySelector('input');
		assert.equal(div.value, 'bar');
	}
};
