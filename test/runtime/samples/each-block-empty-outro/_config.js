export default {
	props: {
		visible: true,
		empty: []
	},

	html: `
		<div>
			<p>text</p>
		</div>
	`,

	nestedTransitions: true,

	test(assert, component, target) {
		component.visible = false;

		assert.htmlEqual(target.innerHTML, ``);
	}
};