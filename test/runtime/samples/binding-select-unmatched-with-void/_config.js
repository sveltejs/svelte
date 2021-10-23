// This test make sure if value is bind value is (void 0) then
// it should set to same as the selected option value 
export default {
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `
		<p>selected: c</p>

		<select>
			<option value='a'>a</option>
			<option value='b'>b</option>
			<option value='c' selected>c</option>
		</select>

		<p>selected: c</p>
	`);
	}
};
