export default {
	html: `
		<div class='SHOUTY'>YELL</div>

		<svg viewBox='0 0 100 100'>
			<text textLength=100>hellooooo</text>
		</svg>
	`,

	test(assert, component, target) {
		const attr = sel => target.querySelector(sel).attributes[0].name;

		assert.equal(attr('div'), 'class');
		assert.equal(attr('svg'), 'viewBox');
		assert.equal(attr('text'), 'textLength');
	}
};