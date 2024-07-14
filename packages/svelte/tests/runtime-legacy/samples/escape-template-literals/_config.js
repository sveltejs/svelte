import { test } from '../../test';

export default test({
	html: '<code>`${foo}\\n`</code>\n`\n<div title="`${foo}\\n`">foo</div>\n<div>`${foo}\\n`</div>'
});
