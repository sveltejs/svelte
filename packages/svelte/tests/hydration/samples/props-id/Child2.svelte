<script>
	let id = $props.id();
</script>


{#await Promise.resolve() then x}{/await}
<p>{id}</p>