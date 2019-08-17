export default {
	props: {
		myClass: 'one two'
	},

	html: `<div class="one two three four"></div>`,

	test({ assert, component, target, window }) {
		component.myClass = 'one';

		assert.htmlEqual(target.innerHTML, `
			<div class="one three four"></div>
		`);
	}
};
