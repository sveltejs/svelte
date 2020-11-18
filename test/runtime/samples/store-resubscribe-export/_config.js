let unsubscribeCalled = false;

const fakeStore = val => ({
	subscribe: cb => {
		cb(val);
		return {
			unsubscribe: () => {
				unsubscribeCalled = true;
			}
		};
	}
});

export default {
	props: {
		foo: fakeStore(1)
	},
	html: `
		<h1>1</h1>
	`,

	async test({ assert, component, target }) {
		component.foo = fakeStore(5);

		assert.htmlEqual(target.innerHTML, '<h1>5</h1>');

		assert.ok(unsubscribeCalled);
	}
};
