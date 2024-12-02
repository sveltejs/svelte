import { test } from '../../test';

export default test({
	html: `<p>text before the render tag dont fuse this text with the one from the child</p>`
});
