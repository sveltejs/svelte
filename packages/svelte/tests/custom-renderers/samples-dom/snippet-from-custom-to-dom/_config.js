import { test } from '../../test-dom.test';

export default test({
	// the snippet belongs to the custom renderer, so rendering it inside the DOM child crosses back
	html: '<div><dom-host><div><custom-root><span>hello world</span></custom-root></div></dom-host></div>'
});
