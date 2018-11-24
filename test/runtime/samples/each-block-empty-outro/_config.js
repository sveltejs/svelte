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

	test({ assert, component, target }) {
		component.visible = false;

		assert.htmlEqual(target.innerHTML, ``);
	}
};