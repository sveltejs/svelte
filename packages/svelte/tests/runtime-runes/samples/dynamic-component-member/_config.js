import { test } from '../../test';

export default test({
	mode: ['client', 'server'],

	html: `<span>x</span>`,
	ssrHtml: `<span>x</span>`
});
