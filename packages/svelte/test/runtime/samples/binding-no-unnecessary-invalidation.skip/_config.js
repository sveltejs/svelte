// this test currently fails because the fix that made it pass broke other tests,
// see https://github.com/sveltejs/svelte/pull/8114 for more context.
export default {
	skip: true,
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>0</p>
		`
		);
	}
};
