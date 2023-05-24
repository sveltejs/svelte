export default {
	get props() {
		return {
			visible: false,
			things: ['a', 'b', 'c', 'd']
		};
	},

	// intro: true,

	html: `
		<p>waiting...</p>
	`,

	async test({ assert, component, target, raf }) {
		component.visible = true;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>introstart</p>
			<p>a</p>
			<p>b</p>
			<p>c</p>
			<p>d</p>
		`
		);

		raf.tick(50);
		assert.deepEqual(component.intros.sort(), ['a', 'b', 'c', 'd']);
		assert.equal(component.intro_count, 4);

		await raf.tick(100);
		assert.equal(component.intro_count, 0);

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>introend</p>
			<p>a</p>
			<p>b</p>
			<p>c</p>
			<p>d</p>
		`
		);

		component.visible = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>outrostart</p>
			<p>a</p>
			<p>b</p>
			<p>c</p>
			<p>d</p>
		`
		);

		raf.tick(150);
		assert.deepEqual(component.outros.sort(), ['a', 'b', 'c', 'd']);
		assert.equal(component.outro_count, 4);

		raf.tick(200);
		assert.equal(component.outro_count, 0);

		component.visible = true;

		await raf.tick(250);
		assert.deepEqual(component.intros.sort(), ['a', 'a', 'b', 'b', 'c', 'c', 'd', 'd']);
		assert.equal(component.intro_count, 4);

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>introstart</p>
			<p>a</p>
			<p>b</p>
			<p>c</p>
			<p>d</p>
		`
		);
	}
};
