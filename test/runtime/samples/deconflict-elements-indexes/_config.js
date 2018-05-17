export default {
	html: `
		<div>
			<i>one</i>
		</div>
	`,

	preserveIdentifiers: true,

	test(assert, component, target) {
		const { tagList } = component.get();
		tagList.push('two');
		component.set({ tagList });

		assert.htmlEqual(target.innerHTML, `
			<div>
				<i>one</i>
				<i>two</i>
			</div>
		`);
	}
};