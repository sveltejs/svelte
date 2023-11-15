import { test } from '../../test';

export default test({
	get props() {
		return {
			todos: [
				{ id: 123, description: 'buy milk' },
				{ id: 234, description: 'drink milk' }
			]
		};
	},

	html: `
		<p>buy milk</p>
		<p>drink milk</p>
	`,

	test({ assert, component, target }) {
		const [p1, p2] = target.querySelectorAll('p');

		component.todos = [
			{ id: 123, description: 'buy beer' },
			{ id: 234, description: 'drink beer' }
		];
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>buy beer</p>
			<p>drink beer</p>
		`
		);

		const [p3, p4] = target.querySelectorAll('p');

		assert.equal(p1, p3);
		assert.equal(p2, p4);
	}
});
