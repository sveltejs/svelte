export default {
	html: '<div>0</div><div>0</div>',
	async test({ assert, component, target }) {
		let [div1, div2] = target.querySelectorAll('div');

		component.value = 5;
		assert.htmlEqual(target.innerHTML, '<div>5</div><div>0</div>');
		assert.notStrictEqual(div1, target.querySelectorAll('div')[0]);
		assert.strictEqual(div2, target.querySelectorAll('div')[1]);
		[div1, div2] = target.querySelectorAll('div');

		component.reactive = 10;
		assert.htmlEqual(target.innerHTML, '<div>5</div><div>10</div>');
		assert.strictEqual(div1, target.querySelectorAll('div')[0]);
		assert.strictEqual(div2, target.querySelectorAll('div')[1]);
	}
};
