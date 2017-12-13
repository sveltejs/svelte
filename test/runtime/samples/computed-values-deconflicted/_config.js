export default {
	solo: true,

	html: '<span>waiting</span>',

	test(assert, component, target) {
		component.set({ x: 'ready' });
		assert.htmlEqual(target.innerHTML, `
			<span>ready</span>
		`);
	}
};
