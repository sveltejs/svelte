export default {
	html:'<div>same text</div>',
	async test({ assert, component, target }) {
		await new Promise(f => setTimeout(f, 10));
		assert.htmlEqual(target.innerHTML, `
			<div>same text text</div>
		`);
	}
};
