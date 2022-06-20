export default {
	skip_if_ssr: true, // SSR behaviour is awkwardly different

	props: {
		foo: 42
	},

	html: '<textarea></textarea>',

	test({ assert, component, target }) {
		const textarea = target.querySelector( 'textarea' );
		assert.strictEqual( textarea.value, '42' );

		component.foo = 43;
		assert.strictEqual( textarea.value, '43' );
	}
};
