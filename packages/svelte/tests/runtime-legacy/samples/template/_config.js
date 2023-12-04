import { ok, test } from '../../test';

export default test({
	html: `
	<template id="t1">
	    <div>foo</div>
	</template>
	<template id="t2">123</template>
	<template id="t3">1<b>B</b>1</template>
	`,

	test({ assert, target }) {
		const template = /** @type {HTMLTemplateElement} */ (target.querySelector('#t1'));
		assert.htmlEqual(
			template.innerHTML,
			`
		<div>foo</div>
   	    `
		);
		const content = /** @type {DocumentFragment} */ (template.content.cloneNode(true));
		const div = content.children[0];
		assert.htmlEqual(
			div.outerHTML,
			`
			<div>foo</div>
		`
		);

		const template2 = /** @type {HTMLTemplateElement} */ (target.querySelector('#t2'));
		assert.equal(template2.childNodes.length, 0);
		assert.equal(template2.content.childNodes.length, 1);
		assert.equal(template2.content.firstChild?.textContent, '123');
		assert.htmlEqual(template2.innerHTML, '123');

		const template3 = /** @type {HTMLTemplateElement} */ (target.querySelector('#t3'));
		// test: (with hydration from ssr rendered html)
		// out of order render.
		// <template>1{@html '2'}3</template>  may render as <template>321</template> for ssr+hydration case.
		// we bypass it by using symmetric siblings. hence <template> is not fully stable for this edge case.

		// get all childNodes of template3 except comments
		let childNodes = [];
		for (const node of template3.content.childNodes) {
			if (node.nodeType !== 8) {
				childNodes.push(/** @type {Element} */ (node));
			}
		}

		assert.equal(childNodes.length, 3);
		assert.equal(childNodes[0].textContent, '1');
		assert.equal(childNodes[1].outerHTML, '<b>B</b>');
		assert.equal(childNodes[2].textContent, '1');
	}
});
