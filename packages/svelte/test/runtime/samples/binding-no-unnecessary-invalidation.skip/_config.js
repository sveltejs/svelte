// see https://github.com/sveltejs/svelte/pull/8114 for more context.
export default {
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>0</p>
		`
		);
	}
};
