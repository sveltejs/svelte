export default {
	html: '<div>00</div>',
	async test({ assert, component, target }) {
		const div = target.querySelector('div');
		component.anotherValue = 2;
		assert.htmlEqual(target.innerHTML, '<div>02</div>');
		assert.strictEqual(div, target.querySelector('div'));
	}
};
