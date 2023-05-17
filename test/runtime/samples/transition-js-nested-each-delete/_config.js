export default {
	get props() {
		return { visible: true, things: ['a', 'b', 'c'] };
	},

	test({ assert, component, target, raf }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>a</div>
			<div>b</div>
			<div>c</div>
		`
		);

		component.things = ['a'];

		raf.tick(100);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>a</div>
		`
		);

		component.visible = false;

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
	}
};
