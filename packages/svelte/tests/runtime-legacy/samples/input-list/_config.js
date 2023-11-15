import { test } from '../../test';

export default test({
	html: `
		<input list='suggestions'>
		<datalist id='suggestions'>
			<option value='foo'/><option value='bar'/><option value='baz'/>
		</datalist>
	`
});
