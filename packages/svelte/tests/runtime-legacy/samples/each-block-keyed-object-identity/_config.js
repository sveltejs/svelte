import { test } from '../../test';

export default test({
	get props() {
		return {
			todos: [
				{
					description: 'implement keyed each blocks'
				},
				{
					description: 'implement client-side hydration'
				}
			]
		};
	},

	html: `
		<p>1: implement keyed each blocks</p>
		<p>2: implement client-side hydration</p>
	`,

	test({ assert, component, target }) {
		const [p1, p2] = target.querySelectorAll('p');

		component.todos = [component.todos[1]];
		assert.htmlEqual(target.innerHTML, '<p>1: implement client-side hydration</p>');

		const [p3] = target.querySelectorAll('p');

		assert.ok(!target.contains(p1), 'first `<p>` element should be removed');
		assert.equal(p2, p3, 'second `<p>` element should be retained');
	}
});
