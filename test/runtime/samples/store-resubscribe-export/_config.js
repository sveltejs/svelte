let subscribeCalled = false;

const fakeStore = val => ({
	subscribe: cb => {
		cb(val);
		return {
			unsubscribe: () => {
				subscribeCalled = true;
			},
		};
	},
});

export default {
	props: {
		foo: fakeStore(1),
	},
	html: `
		<h1>1</h1>
	`,

	async test({ assert, component, target }) {
		component.foo = fakeStore(5);

		return assert.htmlEqual(target.innerHTML, `<h1>5</h1>`);
	},
};
