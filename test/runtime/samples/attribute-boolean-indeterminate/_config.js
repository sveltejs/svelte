export default {
	props: {
		indeterminate: true
	},

	html: "<input type='checkbox'>",

	// somehow ssr will render indeterminate=""
	// the hydrated html will still contain that attribute
	ssrHtml: "<input type='checkbox' indeterminate=''>",

	test({ assert, component, target }) {
		const input = target.querySelector('input');

		assert.ok(input.indeterminate);
		component.indeterminate = false;
		assert.ok(!input.indeterminate);
	}
};
