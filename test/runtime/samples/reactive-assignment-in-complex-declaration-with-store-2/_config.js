// destructure to store value
export default {
	skip_if_ssr: true, // pending https://github.com/sveltejs/svelte/issues/3582
	html: '<h1>2 2 xxx 5 6 9 10 2</h1>',
	async test({ assert, target, component }) {
		await component.update();
		assert.htmlEqual(target.innerHTML, '<h1>11 11 yyy 12 13 14 15 11</h1>');
	}
};
