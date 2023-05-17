export default {
	html: '<div>content</div><div>content</div><div>content</div>',

	test({ assert, target, component }) {
		const divs = target.querySelectorAll('div');
		assert.equal(component.refs[0], divs[0]);
		assert.equal(component.refs[1], divs[1]);
		assert.equal(component.refs[2], divs[2]);
	}
};
