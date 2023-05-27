<script>
	export let array = [1];

	export function append(value) {
		array.push(value);
		array = array;
	}
</script>

{#key array}
	<div>{array.join(',')}</div>
{/key}