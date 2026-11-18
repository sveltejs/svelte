import { test } from '../../test-dom.test';

export default test({
	target: 'dom',
	error: 'Cannot render content belonging to a custom renderer inside the DOM'
});
