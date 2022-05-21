export default {
	compileOptions: {
		dev: true
	},
	props: {
		selected: true
	},
	test({ assert, component }) {
		try {
			component.selected = false;
			throw new Error('Expected an error');
		} catch (err) {
			assert.equal(err.message, 'this={...} of <svelte:component> should specify a Svelte component.');
		}
	}
};
