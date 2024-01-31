import { test } from '../../test';

export default test({
	html: '1 2 <div></div> <input type="number"> <input type="number">',
	ssrHtml: '1 2 <div></div> <input type="number" value="1"> <input type="number" value="2">'
});
