export default {
	// This is a bit of a funny one — there's no equivalent attribute,
	// so it can't be server-rendered
	'skip-ssr': true,

	data: {
		indeterminate: true
	},

	html: `
		<input type='checkbox'>
	`,

	test(assert, component, target) {
		const input = target.querySelector('input');

		assert.ok(input.indeterminate);
		component.set({ indeterminate: false });
		assert.ok(!input.indeterminate);
	}
};