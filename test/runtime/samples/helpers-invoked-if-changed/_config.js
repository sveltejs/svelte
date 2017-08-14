import counter from './counter.js';

export default {
	data: {
		x: 1,
		y: 2,
		z: 3
	},

	html: `
		<p>1</p>
		<p class='2'>3</p>
	`,

	test(assert, component) {
		counter.y = counter.z = 0;

		component.set({ x: 4 });
		assert.equal(counter.y, 0);
		assert.equal(counter.z, 0);

		component.set({ x: 5, y: 6 });
		assert.equal(counter.y, 1);
		assert.equal(counter.z, 0);

		component.set({ x: 6, y: 6 });
		assert.equal(counter.y, 1);
		assert.equal(counter.z, 0);

		component.set({ z: 7 });
		assert.equal(counter.y, 1);
		assert.equal(counter.z, 1);

		component.set({ x: 8, z: 7 });
		assert.equal(counter.y, 1);
		assert.equal(counter.z, 1);
	}
};
