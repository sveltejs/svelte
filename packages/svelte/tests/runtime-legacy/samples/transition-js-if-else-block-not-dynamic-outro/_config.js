import { test } from '../../test';

export default test({
	async test({ assert, component, target, raf }) {
		const t = target.querySelector('#t');

		await (component.condition = false);

		let time = 0;
		raf.tick((time += 25));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div id="t" foo="0.75">TRUE</div>
			<div id="f">FALSE</div>
		`
		);

		// toggling back in the middle of the out transition
		// will reuse the previous element
		await (component.condition = true);

		assert.htmlEqual(
			target.innerHTML,
			`
			<div id="t" foo="1">TRUE</div>
			<div id="f">FALSE</div>
		`
		);
		assert.equal(target.querySelector('#t'), t);

		raf.tick((time += 25));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div id="t" foo="1">TRUE</div>
			<div id="f" foo="0.75">FALSE</div>
		`
		);

		raf.tick((time += 75));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div id="t" foo="1">TRUE</div>
		`
		);
	}
});
