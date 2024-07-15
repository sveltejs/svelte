<script>
	// a leading comment
	const a = 1; // a trailing comment
	const b = 2;

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
>
{/* leading block comment */ a}
</button>
{ // leading line comment
	a + b // trailing line comment
	/* trailing block comment */
}
