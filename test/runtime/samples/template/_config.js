export default {
	// solo: 1,

	html: `
		<template>
			<div>foo</div>
		</template>
	`,

	test({ assert, target }) {
		const template = target.querySelector('template');

		assert.htmlEqual(template.innerHTML, `
			<div>foo</div>
		`);

		const content = template.content.cloneNode(true);
		const div = content.children[0];
		assert.htmlEqual(div.outerHTML, `
			<div>foo</div>
		`);
	}
};
