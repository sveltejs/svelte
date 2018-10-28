export default {
	data: {
		animalPawsEntries: [
			['raccoon', 'hands'],
			['eagle', 'wings']
		]
	},

	html: `
		<p>hands</p>
		<p>wings</p>
	`,

	test ( assert, component, target ) {
		component.set({ animalPawsEntries: [['foo', 'bar']] });
		assert.htmlEqual( target.innerHTML, `
			<p>bar</p>
		`);
	},
};
