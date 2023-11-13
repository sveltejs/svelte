import { test } from '../../test';

export default test({
	get props() {
		return { propTag: 'hr' };
	},
	html: '<h1></h1><foo></foo><img><hr><input><br>',

	test({ assert, component, target }) {
		assert.htmlEqual(target.innerHTML, '<h1></h1><foo></foo><img><hr><input><br>');
		component.propTag = 'link';
		assert.htmlEqual(target.innerHTML, '<h1></h1><foo></foo><img><link><input><br>');
	}
});
