export default {
	html: '<div>0</div>',
	async test({ assert, component, target, window, raf }) {
		component.value = 2;
		
		const [div1, div2] = target.querySelectorAll('div');

		assert.htmlEqual(div1.outerHTML, '<div>0</div>');
		assert.htmlEqual(div2.outerHTML, '<div>2</div>');

		raf.tick(0);

		assert.equal(div1.foo, 1);
		assert.equal(div1.oof, 0);

		assert.equal(div2.foo, 0);
		assert.equal(div2.oof, 1);

		raf.tick(200);

		assert.htmlEqual(target.innerHTML, '<div>2</div>');
		assert.equal(div2, target.querySelector('div'));
	}
};
