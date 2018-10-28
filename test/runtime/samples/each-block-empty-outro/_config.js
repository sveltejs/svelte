export default {
	data: {
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
		component.set({ visible: false });

		assert.htmlEqual(target.innerHTML, ``);
	}
};