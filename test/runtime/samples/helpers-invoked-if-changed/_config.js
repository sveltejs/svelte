export default {
	data: {
		x: 1,
		y: 2
	},

	html: `
		<p>1</p>
		<p>2</p>
	`,

	test(assert, component) {
		global.count = 0;

		component.set({ x: 3 });
		assert.equal(global.count, 0);

		component.set({ x: 4, y: 5 });
		assert.equal(global.count, 1);

		component.set({ x: 5, y: 5 });
		assert.equal(global.count, 1);
	}
};
