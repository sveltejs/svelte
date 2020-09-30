// with reactive content beside `key`
export default {
	html: '<div>00</div>',
	async test({ assert, component, target, window }) {
		const div = target.querySelector('div');
		component.reactive = 2;
		assert.htmlEqual(target.innerHTML, '<div>02</div>');
		assert.strictEqual(div, target.querySelector('div'));

		component.value = 5;
		assert.htmlEqual(target.innerHTML, '<div>52</div>');
		assert.notStrictEqual(div, target.querySelector('div'));
	}
};
