import { test } from '../../test';

export default test({
	html: `
		<input list='suggestions'>
		<datalist id='suggestions'>
			<option value='foo'></option>
			<option value='bar'></option>
			<option value='baz'></option>
		</datalist>
	`
});
