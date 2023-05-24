export default {
	get props() {
		return { coords: [0, 0], numbers: { answer: 42 } };
	},

	html: `
		<p>0,0</p>
		<p>42</p>
	`,

	test({ assert, component, target }) {
		component.coords = [1, 2];
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>1,2</p>
			<p>42</p>
		`
		);

		component.numbers = { answer: 43 };
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>1,2</p>
			<p>43</p>
		`
		);
	}
};
