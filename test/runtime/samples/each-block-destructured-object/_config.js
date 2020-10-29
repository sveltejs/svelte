export default {
	props: {
		animalPawsEntries: [
			{ animal: 'raccoon', pawType: 'hands' },
			{ animal: 'eagle', pawType: 'wings' }
		]
	},

	html: `
		<p>raccoon: hands</p>
		<p>eagle: wings</p>
	`,

	test({ assert, component, target }) {
		component.animalPawsEntries = [{ animal: 'cow', pawType: 'hooves' }];
		assert.htmlEqual( target.innerHTML, `
			<p>cow: hooves</p>
		`);
	}
};
