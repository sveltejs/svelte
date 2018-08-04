export default {
	data: {
		todos: [
			{ id: 123, description: 'one' },
			{ id: 234, description: 'two' },
			{ id: 345, description: 'three' },
		]
	},

	html: `
		<p>1: one</p>
		<p>2: two</p>
		<p>3: three</p>
	`,

	nestedTransitions: true,

	test(assert, component, target) {
		const { todos } = component.get();

		const [p1, p2, p3] = target.querySelectorAll('p');

		component.set({
			todos: todos.reverse()
		});

		assert.htmlEqual(target.innerHTML, `
			<p>1: three</p>
			<p>2: two</p>
			<p>3: one</p>
		`);

		const [p4, p5, p6] = target.querySelectorAll('p');

		assert.equal(p1, p6);
		assert.equal(p2, p5);
		assert.equal(p3, p4);

		component.destroy();
	}
};
