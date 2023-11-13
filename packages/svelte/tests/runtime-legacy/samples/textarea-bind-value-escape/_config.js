import { test } from '../../test';

export default test({
	html: '<textarea></textarea>',
	ssrHtml:
		"<textarea>test'\"&gt;&lt;/textarea&gt;&lt;script&gt;alert('BIM');&lt;/script&gt;</textarea>"
});
