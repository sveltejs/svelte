export default {
	html: '',

	test({ assert, component, target }) {
		component.show = true;
		assert.equal(target.innerHTML, '<svg><circle cx="200" cy="500" r="200"></circle></svg>');
		assert.instanceOf(target.querySelector('svg'), SVGElement);
		assert.instanceOf(target.querySelector('circle'), SVGElement);
	}
};
