import { test } from '../../test';

export default test({
	html: '',

	test({ assert, component, target }) {
		component.show = true;
		assert.htmlEqual(target.innerHTML, '<svg><circle cx="200" cy="500" r="200"></circle></svg>');
		assert.instanceOf(target.querySelector('svg'), SVGElement);
		assert.instanceOf(target.querySelector('circle'), SVGElement);
	}
});
