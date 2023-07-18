export default {
	get props() {
		return { propTag: 'hr' };
	},
	html: '<h1></h1><col><img><hr><input><br>',

	test({ assert, component, target }) {
		assert.htmlEqual(target.innerHTML, '<h1></h1><col><img><hr><input><br>');
		component.propTag = 'link';
		assert.htmlEqual(target.innerHTML, '<h1></h1><col><img><link><input><br>');
	}
};
