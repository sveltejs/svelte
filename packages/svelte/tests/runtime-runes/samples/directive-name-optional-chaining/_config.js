import { test } from '../../test';

export default test({
	ssrHtml: `<div></div><div></div><div></div><div></div>`,
	html: `<div>state</div><div></div><div>store</div><div>prop</div>`
});
