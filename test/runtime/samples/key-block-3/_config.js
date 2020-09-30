// key is not used in the template
export default {
	html: '<div></div>',
	async test({ assert, component, target, window }) {
		const div = target.querySelector('div');

		component.value = 5;
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.notStrictEqual(div, target.querySelector('div'));
	}
};
