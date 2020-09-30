export default {
	html: '<div>3</div>',
	async test({ assert, component, target, window }) {
		const div = target.querySelector('div');

		await component.mutate();
		assert.htmlEqual(target.innerHTML, '<div>5</div>');
		assert.strictEqual(div, target.querySelector('div'));

		await component.reassign();
		assert.htmlEqual(target.innerHTML, '<div>7</div>');
		assert.strictEqual(div, target.querySelector('div'));

		await component.changeKey();
		assert.htmlEqual(target.innerHTML, '<div>7</div>');
		assert.notStrictEqual(div, target.querySelector('div'));
	}
};
