export default {
	html: `
		1
	`,

	test({ assert, component, target }) {
		component.desks = [
			{
				id: 1,
				teams: [{ id: 2 }]
			}
		];

		assert.htmlEqual(target.innerHTML, '2');
	}
};
