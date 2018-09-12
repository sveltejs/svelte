export default {
	nestedTransitions: true,

	data: {
		things: ['a', 'b', 'c']
	},

	test(assert, component, target, window, raf) {
		assert.htmlEqual(target.innerHTML, `
			<div>a</div>
			<div>b</div>
			<div>c</div>
		`);

		component.set({ things: ['b', 'c', 'a'] });

		assert.htmlEqual(target.innerHTML, `
			<div>b</div>
			<div>c</div>
			<div>a</div>
		`);
	},
};
