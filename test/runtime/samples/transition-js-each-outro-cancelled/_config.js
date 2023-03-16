export default {
	html: '<section></section>',
	async test({ assert, component, target, raf }) {
		await component.add();
		await component.add();

		let time = 0;

		assert.htmlEqual(target.innerHTML, `
			<section>
				<div t="0">Thing 1</div>
				<div t="0">Thing 2</div>
			</section>
		`);

		raf.tick(time += 400);

		assert.htmlEqual(target.innerHTML, `
			<section>
				<div t="1">Thing 1</div>
				<div t="1">Thing 2</div>
			</section>
		`);

		await component.toggle();
		// transition halfway
		raf.tick(time += 200);

		assert.htmlEqual(target.innerHTML, `
			<section t="0.5">
				<div t="1">Thing 1</div>
				<div t="1">Thing 2</div>
			</section>
		`);

		await component.toggle();
		// transition back
		raf.tick(time += 200);

		assert.htmlEqual(target.innerHTML, `
			<section t="1">
				<div t="1">Thing 1</div>
				<div t="1">Thing 2</div>
			</section>
		`);

		await component.remove(1);

		raf.tick(time += 400);

		assert.htmlEqual(target.innerHTML, `
			<section t="1">
				<div t="1">Thing 2</div>
			</section>
		`);
	}
};
