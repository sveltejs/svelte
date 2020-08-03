export default {
	props: {
		animalEntries: [
			{ animal: 'raccoon', class: 'mammal', species: 'P. lotor', kilogram: 25 },
			{ animal: 'eagle', class: 'bird', kilogram: 5.4 }
		]
	},

	html: `
		<p class="mammal">raccoon - P. lotor - 25kg (55 lb)</p>
		<p class="bird">eagle - unknown - 5.4kg (12 lb)</p>
	`,

	test({ assert, component, target }) {
		component.animalEntries = [{ animal: 'cow', class: 'mammal', species: '‎B. taurus' }];
		assert.htmlEqual(target.innerHTML, `
			<p class="mammal">cow - ‎B. taurus - 50kg (110 lb)</p>
		`);
	}
};
