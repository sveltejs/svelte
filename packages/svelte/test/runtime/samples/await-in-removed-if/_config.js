let fulfil;

const promise = new Promise((f) => {
	fulfil = f;
});

export default {
	get props() {
		return { promise };
	},

	html: '',

	async test({ assert, component, target }) {
		component.condition = false;

		fulfil();
		await new Promise((f) => setTimeout(f, 0));

		assert.htmlEqual(target.innerHTML, '');
	}
};
