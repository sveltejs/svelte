<script>
	export let value = 0;
	export let anotherValue = 0;
	export let thirdValue = 0;
</script>

{#key value + anotherValue}
	<div>{value}{anotherValue}{thirdValue}</div>
{/key}