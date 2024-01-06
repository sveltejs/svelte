import { test } from '../../test';

export default test({
	html: `<div>&nbsp;hello</div>
	<div>&nbsp;hello&nbsp;&nbsp;</div>
	<div>&nbsp;hello&nbsp; &nbsp;hello</div>`,

	test({ assert, target }) {
		const div_list = target.querySelectorAll('div');
		assert.equal(div_list[0].textContent, ' hello');
		assert.equal(div_list[1].textContent, ' hello  ');
		assert.equal(div_list[2].textContent, ' hello   hello');
	}
});
