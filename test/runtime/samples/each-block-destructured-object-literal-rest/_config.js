export default {
	props: {
		objectsArray: [
			{ quote: 'q1', 'wrong-quote': 'wq1', 16: '16', class: 'class' },
			{ quote: 'q2', 'wrong-quote': 'wq2', 16: 'sixteen', class: 'glass' },
			{ quote: 'q3', 'wrong-quote': 'wq3', 16: 'seize', class: 'mass' }
		]
	},

	html: `
    <p class="class">Quote: q1, Wrong Quote: wq1, 16: 16</p>
    <p class="glass">Quote: q2, Wrong Quote: wq2, 16: sixteen</p>
    <p class="mass">Quote: q3, Wrong Quote: wq3, 16: seize</p>
	`,

	test({ assert, component, target }) {
		component.objectsArray = [{ quote: 'new-quote', 'wrong-quote': 'wq4', 16: 'ten+six', role: 'role' }];
		assert.htmlEqual(target.innerHTML, `
			<p role="role">Quote: new-quote, Wrong Quote: wq4, 16: ten+six</p>
		`);
	}
};
