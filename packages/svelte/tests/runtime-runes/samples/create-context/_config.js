import { test } from '../../test';

export default test({
	transformError: () => 'boom',
	html: `<h1>hello</h1> <p>caught</p> fallback`
});
