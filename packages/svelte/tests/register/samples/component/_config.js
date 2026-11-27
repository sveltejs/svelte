import { test } from '../../test';

export default test({
	expected: {
		imported: '<!--[--><h1>Hello import! 2 4</h1><!--]-->',
		required: '<!--[--><h1>Hello require! 2 4</h1><!--]-->'
	}
});
