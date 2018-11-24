export default {
	props: {
		visible: true,
		things: ['a', 'b', 'c', 'd']
	},

	intro: true,

	test({ assert, component, target, window, raf }) {
		raf.tick(50);
		assert.deepEqual(component.intros.sort(), ['a', 'b', 'c', 'd']);
		assert.equal(component.intro_count, 4);

		raf.tick(100);
		assert.equal(component.intro_count, 0);

		component.visible = false;

		raf.tick(150);
		assert.deepEqual(component.outros.sort(), ['a', 'b', 'c', 'd']);
		assert.equal(component.outro_count, 4);

		raf.tick(200);
		assert.equal(component.outro_count, 0);

		component.visible = true;
		component.$on('intro.start', () => {
			throw new Error(`intro.start should fire during set(), not after`);
		});

		raf.tick(250);
		assert.deepEqual(component.intros.sort(), ['a', 'a', 'b', 'b', 'c', 'c', 'd', 'd']);
		assert.equal(component.intro_count, 4);
	}
};