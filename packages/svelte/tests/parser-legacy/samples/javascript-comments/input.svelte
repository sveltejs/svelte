<script>
	// a leading comment
	const a = 1; // a trailing comment
	const b = 2;

	/** a comment */
	function asd() {
		foo;
		/* comment belonging to noone */
	}
</script>

<button
	on:click={// comment
	() => {
		/* another comment */
		fn(); // a trailing comment
		/* comment belonging to noone */
	}}
>
{/* leading block comment */ a}
</button>
{ // leading line comment
	a + b // trailing line comment
	/* trailing block comment */
}
