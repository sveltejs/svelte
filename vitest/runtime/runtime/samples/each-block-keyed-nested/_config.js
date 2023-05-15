export default {
	html: `
		1
	`,

	test({ assert, component, target }) {
		component.desks = [
			{
				id: 1,
				teams: []
			}
		];

		assert.htmlEqual(target.innerHTML, '');
	}
};
