<script>
	// a leading comment
	const a = true; // a trailing comment

	/** a comment */
	function asd() {

	}
</script>

<button
	on:click={// comment
	() => {
		/* another comment */
		fn();
	}}
></button>
