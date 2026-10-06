<script module>
	// svelte-ignore state_referenced_locally
	export const answer = 42;
</script>

<script>
	let count = $state(0),
		doubled = count * 2;
</script>

{doubled}
