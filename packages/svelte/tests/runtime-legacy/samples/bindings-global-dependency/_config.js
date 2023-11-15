import { test } from '../../test';

export default test({
	html: '<input type="text">',
	ssrHtml: '<input type="text" value="">'
});
