export default {
	data: {
		animalPawsEntries: [
			['raccoon', 'hands'],
			['eagle', 'wings']
		]
	},

	html: `
		<p>raccoon: hands</p>
		<p>eagle: wings</p>
	`,

	test ( assert, component, target ) {
		component.set({ animalPawsEntries: [['foo', 'bar']] });
		assert.htmlEqual( target.innerHTML, `
			<p>foo: bar</p>
		`);
	},
};
