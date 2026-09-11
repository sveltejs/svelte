import { test } from '../../test';

// this would fail immediately if it was compiling like a rich select because it access the DOM
export default test({
	html: '<select><selectedcontent></selectedcontent><option><span>Rich</span></option></select>'
});
