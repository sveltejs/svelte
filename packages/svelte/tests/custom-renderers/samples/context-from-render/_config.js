import { test } from '../../test';

export default test({
	html: '<span>hello from render</span>',
	context: new Map([['message', 'hello from render']])
});
