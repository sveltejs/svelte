export default {
	props: {
		animalPawsEntries: [
			['raccoon', 'hands'],
			['eagle', 'wings']
		]
	},

	html: `
		<p>hands</p>
		<p>wings</p>
	`,

	test({ assert, component, target }) {
		component.animalPawsEntries = [['foo', 'bar']];
		assert.htmlEqual( target.innerHTML, `
			<p>bar</p>
		`);
	}
};
