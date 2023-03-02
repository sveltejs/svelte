<script>
	export let value = 0;
	export let reactive = 0;
</script>

{#key value}
	<div>{value}{reactive}</div>
{/key}