export default {
	html: `
		<div>
			<p>unconditional</p>
		</div>`,

	test(assert, component, target) {
		component.set({ foo: true });
		assert.htmlEqual(target.innerHTML, `
			<div>
				<p>conditional</p>
				<p>unconditional</p>
			</div>
		`);
	}
};
