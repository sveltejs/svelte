export default {
	html: `
		<div class='SHOUTY'>YELL</div>

		<svg viewBox='0 0 100 100' id='one'>
			<text textLength=100>hellooooo</text>
		</svg>

		<svg viewBox='0 0 100 100' id='two'>
			<text textLength=100>hellooooo</text>
		</svg>
	`,

	test(assert, component, target) {
		const attr = sel => target.querySelector(sel).attributes[0].name;

		assert.equal(attr('div'), 'class');
		assert.equal(attr('svg#one'), 'viewBox');
		assert.equal(attr('svg#one text'), 'textLength');
		assert.equal(attr('svg#two'), 'viewBox');
		assert.equal(attr('svg#two text'), 'textLength');
	}
};
