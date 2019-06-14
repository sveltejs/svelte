export default {
	html: `<div>&nbsp;hello</div>
	<div>&nbsp;hello&nbsp;</div>
	<div>&nbsp;hello&nbsp;hello</div>`,

	test({ assert, component, target }) {
		var divList = target.querySelectorAll('div')
		assert.equal( divList[0].textContent.charCodeAt( 0 ), 160 );
		assert.equal( divList[1].textContent.charCodeAt( 0 ), 160 );
		assert.equal( divList[1].textContent.charCodeAt( 6 ), 160 );
		assert.equal( divList[2].textContent.charCodeAt( 0 ), 160 );
		assert.equal( divList[2].textContent.charCodeAt( 6 ), 160 );

		
	}
};