export default {
	solo: true,
	skip_if_ssr: true,
	skip_if_hydrate: true,
	html: `
		top fallback
		<hr>
		Middle
		<hr>
		bottom fallback
	`,
	test({ assert, component, target }) {
		component.top = true;
		assert.htmlEqual(target.innerHTML, `
			Top content
			<hr>
			Middle
			<hr>
			bottom fallback
		`);

		component.top = false;
		component.middle = true;
		component.bottom = true;
		assert.htmlEqual(target.innerHTML, `
			top fallback
			<hr>
			Middle content
			<hr>
			Bottom content
		`);
	}
};
