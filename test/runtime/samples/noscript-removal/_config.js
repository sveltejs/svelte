export default {
	html: `
	<div>foo</div>

	<div>foo<div>foo</div></div>
	`,
	ssrHtml: `
	<noscript>foo</noscript>

	<div>foo<noscript>foo</noscript></div>

	<div>foo<div>foo<noscript>foo</noscript></div></div>
	`
};
