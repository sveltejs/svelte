export default {
	data: {
		visible: true,
		things: ['a', 'b', 'c', 'd']
	},

	test (assert, component, target, window, raf) {
		raf.tick(50);
		assert.deepEqual(component.intros.sort(), ['a', 'b', 'c', 'd']);
		assert.equal(component.introCount, 4);

		raf.tick(100);
		assert.equal(component.introCount, 0);

		component.set({ visible: false });

		raf.tick(150);
		assert.deepEqual(component.outros.sort(), ['a', 'b', 'c', 'd']);
		assert.equal(component.outroCount, 4);

		raf.tick(200);
		assert.equal(component.outroCount, 0);

		component.set({ visible: true });
		component.on('intro.start', () => {
			throw new Error(`intro.start should fire during set(), not after`);
		});

		raf.tick(250);
		assert.deepEqual(component.intros.sort(), ['a', 'a', 'b', 'b', 'c', 'c', 'd', 'd']);
		assert.equal(component.introCount, 4);

		component.destroy();
	}
};