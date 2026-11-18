import { test } from '../../test-dom.test';

export default test({
	// the snippet belongs to the DOM, so rendering it inside the custom component crosses into the DOM
	html: '<div><dom-host><span>hello world</span></dom-host></div>'
});
