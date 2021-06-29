export default {
	props: {
		animalEntries: [
			{ animal: 'raccoon', class: 'mammal', species: 'P. lotor', kilogram: 25, bmi: 0.04 },
			{ animal: 'eagle', class: 'bird', kilogram: 5.4 },
			{ animal: 'tiger', class: 'mammal', kilogram: 10, pound: 30 },
			{ animal: 'lion', class: 'mammal', kilogram: 10, height: 50 },
			{ animal: 'leopard', class: 'mammal', kilogram: 30, height: 50, bmi: 10 }
		]
	},

	html: `
		<p class="mammal">raccoon - P. lotor - 25kg (55 lb) - 30cm - 0.04</p>
		<p class="bird">eagle - unknown - 5.4kg (12 lb) - 30cm - 0.006</p>
		<p class="mammal">tiger - unknown - 10kg (30 lb) - 30cm - 0.011111111111111112</p>
		<p class="mammal">lion - unknown - 10kg (22 lb) - 50cm - 0.004</p>
		<p class="mammal">leopard - unknown - 30kg (66 lb) - 50cm - 10</p>
	`,

	test({ assert, component, target }) {
		component.animalEntries = [{ animal: 'cow', class: 'mammal', species: '‎B. taurus' }];
		assert.htmlEqual(target.innerHTML, `
			<p class="mammal">cow - ‎B. taurus - 50kg (110 lb) - 30cm - 0.05555555555555555</p>
		`);
	}
};
