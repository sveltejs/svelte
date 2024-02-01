<script context="module">
	// this should be fine (state rune is not treated as a store)
	const state = $state(0);
	// this is not
	const foo = {};
	const answer = $foo;
</script>

<script>
	let state;
</script>

<p>{answer}</p>