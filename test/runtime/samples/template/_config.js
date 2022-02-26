export default {
	// solo: 1,

	html: `
	<template id="t1">
	    <div>foo</div>
	</template>
	<template id="t2">123</template>
	`,

	test({ assert, target }) {
		
		const template = target.querySelector('#t1');
		assert.htmlEqual(template.innerHTML, `
		<div>foo</div>
   	    `);
		const content = template.content.cloneNode(true);
		const div = content.children[0];
		assert.htmlEqual(div.outerHTML, `
			<div>foo</div>
		`);


		const template2 = target.querySelector('#t2');
		assert.equal(template2.childNodes.length, 0); 
		assert.equal(template2.content.childNodes.length, 1);
		assert.equal(template2.content.firstChild.textContent, '123');
		assert.htmlEqual(template2.innerHTML, '123');

	}
};
