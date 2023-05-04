export default {
	skip_if_ssr: true,
	skip_if_hydrate: true,
	skip_if_hydrate_from_ssr: true,
	test: async ({ component, assert, window, waitUntil }) => {
		assert.htmlEqual(window.document.head.innerHTML, '');
		component.visible = true;
		assert.htmlEqual(window.document.head.innerHTML, '<style>/* empty */</style>');
		await waitUntil(() => window.document.head.innerHTML === '');
		assert.htmlEqual(window.document.head.innerHTML, '');

		component.visible = false;
		assert.htmlEqual(window.document.head.innerHTML, '<style>/* empty */</style>');
		await waitUntil(() => window.document.head.innerHTML === '');
		assert.htmlEqual(window.document.head.innerHTML, '');
	}
};
