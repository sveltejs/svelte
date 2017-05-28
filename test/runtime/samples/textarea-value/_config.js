export default {
	'skip-ssr': true, // SSR behaviour is awkwardly different

	data: {
		foo: 42
	},

	html: `<textarea></textarea>`,

	test ( assert, component, target ) {
		const textarea = target.querySelector( 'textarea' );
		assert.strictEqual( textarea.value, '42' );

		component.set({ foo: 43 });
		assert.strictEqual( textarea.value, '43' );
	}
};