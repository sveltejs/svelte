import { test } from '../../test';

export default test({
	ssrHtml: `
		<select>
			<option selected value="[object Object]">wheeee</option>
		</select>
	`
});
