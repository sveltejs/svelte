export default {
	test: async ({ assert, component, window, waitUntil }) => {
		component.visible = true;
		await waitUntil(() => window.document.head.querySelector('style').sheet.rules.length === 2);
		assert.equal(window.document.head.querySelector('style').sheet.rules.length, 2);
		await waitUntil(() => window.document.head.querySelector('style') === null);
		assert.equal(window.document.head.querySelector('style'), null);
		component.visible = false;
		await waitUntil(() => window.document.head.querySelector('style').sheet.rules.length === 2);
		assert.equal(window.document.head.querySelector('style').sheet.rules.length, 2);
		await waitUntil(() => window.document.head.querySelector('style') === null);
		assert.equal(window.document.head.querySelector('style'), null);
	}
};
