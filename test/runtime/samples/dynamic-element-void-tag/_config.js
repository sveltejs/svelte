export default {
	props: {
		propTag: 'hr'
	},
	html: '<h1></h1><h2></h2><h3></h3><hr><input><br>',

	test({ assert, component, target, ssrHtml }) {
		assert.htmlEqual(target.innerHTML, '<h1></h1><h2></h2><h3></h3><hr><input><br>');
		if (ssrHtml) {
			assert.equal(ssrHtml, '<h1></h1>\n<h2></h2>\n<h3></h3>\n<hr>\n<input>\n<br>');
		}
		component.propTag = 'link';
		assert.htmlEqual(target.innerHTML, '<h1></h1><h2></h2><h3></h3><link><input><br>');
	}
};
