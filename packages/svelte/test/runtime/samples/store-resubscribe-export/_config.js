let unsubscribe_called = false;

const fake_store = (val) => ({
	subscribe: (cb) => {
		cb(val);
		return {
			unsubscribe: () => {
				unsubscribe_called = true;
			}
		};
	}
});

export default {
	get props() {
		return { foo: fake_store(1) };
	},
	html: `
		<h1>1</h1>
	`,

	async test({ assert, component, target }) {
		component.foo = fake_store(5);

		assert.htmlEqual(target.innerHTML, '<h1>5</h1>');

		assert.ok(unsubscribe_called);
	}
};
