export default {
	props: {
		visible: true,
		things: ['a', 'b', 'c']
	},

	test({ assert, component, target, window, raf }) {
		assert.htmlEqual(target.innerHTML, `
			<div>a</div>
			<div>b</div>
			<div>c</div>
		`);

		component.things = ['a'];

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, `
			<div>a</div>
		`);

		component.visible = false;

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
	}
};
