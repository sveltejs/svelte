import { test } from '../../test';

export default test({
	html: `
		<select>
			<option value="please choose">please choose</option>
			<option value="1">1</option>
			<option disabled="" value="2">2</option>
			<option value="3">3</option>
			<option disabled="" value="4">4</option>
			<option value="5">5</option>
		</select>
	`
});
