<select>
	<button aria-label="Selected value">
		<selectedcontent></selectedcontent>
	</button>
	<option>plain text</option>
	<option><b>rich</b><e>content</e></option>
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

	selectedcontent:has(b){
		background-color: rebeccapurple;
	}
</style>