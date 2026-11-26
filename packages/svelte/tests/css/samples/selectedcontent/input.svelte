<select>
	<button aria-label="Selected value">
		<selectedcontent></selectedcontent>
	</button>
	<option>plain text</option>
	<option><b>rich <i>italic</i></b><e>content</e></option>
</select>

<style>
	select,
	::picker(select) {
	  appearance: base-select;
	}
	selectedcontent b{
		color: red;
	}
	e{
		selectedcontent &{
			color: green;
		}
	}
	select > button > selectedcontent > b {
		color: blue;
	}

	select > button > selectedcontent i {
		color: blue;
	}

	selectedcontent:has(b){
		background-color: rebeccapurple;
	}

	selectedcontent:has(i){
		background-color: rebeccapurple;
	}

	option > b{
		color: orange;
	}

	option b{
		color: #ff3e00;
	}

	option > b > i{
		text-decoration: underline;
	}

	option i{
		text-decoration: dashed;
	}
</style>