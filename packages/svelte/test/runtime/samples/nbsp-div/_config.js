export default {
	html: `<div>&nbsp;hello</div>
	<div>&nbsp;hello&nbsp;&nbsp;</div>
	<div>&nbsp;hello&nbsp; &nbsp;hello</div>`,

	test({ assert, target }) {
		const div_list = target.querySelectorAll('div');
		assert.equal(div_list[0].textContent.charCodeAt(0), 160);
		assert.equal(div_list[1].textContent.charCodeAt(0), 160);
		assert.equal(div_list[1].textContent.charCodeAt(6), 160);
		assert.equal(div_list[1].textContent.charCodeAt(7), 160);
		assert.equal(div_list[2].textContent.charCodeAt(0), 160);
		assert.equal(div_list[2].textContent.charCodeAt(6), 160);
		assert.equal(div_list[2].textContent.charCodeAt(7), 32); //normal space
		assert.equal(div_list[2].textContent.charCodeAt(8), 160);
	}
};
