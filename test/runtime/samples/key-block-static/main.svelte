<script>
	let value = 0;
	export let anotherValue = 0;
</script>

{#key value}
	<div>{value}{anotherValue}</div>
{/key}