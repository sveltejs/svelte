export default {
	html: `<div>&nbsp;hello</div>
	<div>&nbsp;hello&nbsp;&nbsp;</div>
	<div>&nbsp;hello&nbsp; &nbsp;hello</div>`,

	test({ assert, target }) {
		const divList = target.querySelectorAll('div');
		assert.equal(divList[0].textContent.charCodeAt(0), 160);
		assert.equal(divList[1].textContent.charCodeAt(0), 160);
		assert.equal(divList[1].textContent.charCodeAt(6), 160);
		assert.equal(divList[1].textContent.charCodeAt(7), 160);
		assert.equal(divList[2].textContent.charCodeAt(0), 160);
		assert.equal(divList[2].textContent.charCodeAt(6), 160);
		assert.equal(divList[2].textContent.charCodeAt(7), 32); //normal space
		assert.equal(divList[2].textContent.charCodeAt(8), 160);
	}
};
