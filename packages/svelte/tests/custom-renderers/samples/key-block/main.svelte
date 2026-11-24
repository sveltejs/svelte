<script>
	let key = $state(0);
	let not_state = 0;
</script>

<button onclick={() => key++}></button>

{#key key}
	<p>{++not_state}</p>
{/key}