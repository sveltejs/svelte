import { test } from '../../test';

export default test({
	html: "<div draggable='false'></div>",

	ssrHtml: "<div foo='1' draggable='false'></div>"
});
