import { test } from '../../test';

export default test({
	html: '<div>content 0 3 3</div><div>content 1 2 2</div><div>content 2 1 1</div>',

	test({ assert, target, component }) {
		const divs = target.querySelectorAll('div');
		assert.equal(component.refs[0], divs[0]);
		assert.equal(component.refs[1], divs[1]);
		assert.equal(component.refs[2], divs[2]);
	}
});
