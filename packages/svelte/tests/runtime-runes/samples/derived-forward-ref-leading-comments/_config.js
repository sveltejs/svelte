import { test } from '../../test';

export default test({
	ssrHtml: '<p>LATER</p> <input value="LATER">',
	html: '<p>LATER</p> <input>'
});
