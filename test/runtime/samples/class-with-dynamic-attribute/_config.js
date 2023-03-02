export default {
	props: {
		myClass: 'one two'
	},

	html: '<div class="one two three"></div>',

	test({ assert, component, target }) {
		component.myClass = 'one';

		assert.htmlEqual(target.innerHTML, `
			<div class="one three"></div>
		`);
	}
};
