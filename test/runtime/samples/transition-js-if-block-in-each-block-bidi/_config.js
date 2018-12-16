export default {
	props: {
		threshold: 5
	},

	html: `
		<div>1</div>
		<div>2</div>
		<div>3</div>
		<div>4</div>
		<div>5</div>
	`,

	intro: true,

	test({ assert, component, target, window, raf }) {
		const divs = target.querySelectorAll('div');

		assert.equal(divs[0].foo, 0);

		raf.tick(100);
		assert.equal(divs[0].foo, 1);

		component.threshold = 4;
		assert.equal(divs[4].foo, 1);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, `
			<div>1</div>
			<div>2</div>
			<div>3</div>
			<div>4</div>
		`);

		component.threshold = 3;
		assert.equal(divs[3].foo, 1);

		raf.tick(300);
		assert.htmlEqual(target.innerHTML, `
			<div>1</div>
			<div>2</div>
			<div>3</div>
		`);
	}
};