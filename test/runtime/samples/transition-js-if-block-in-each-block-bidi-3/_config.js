export default {
	data: {
		foo: false,
		threshold: 5
	},

	html: `
		<div>1</div>
		<div>2</div>
		<div>3</div>
		<div>4</div>
		<div>5</div>
	`,

	test ( assert, component, target, window, raf ) {
		const divs = target.querySelectorAll('div');

		raf.tick(100);

		component.set({ threshold: 4 });
		raf.tick(150);
		component.set({ threshold: 5 });
		raf.tick(200);

		component.set({ threshold: 5.5 });

		assert.htmlEqual(target.innerHTML, `
			<div>1</div>
			<div>2</div>
			<div>3</div>
			<div>4</div>
			<div>5</div>
		`);

		component.destroy();
	}
};