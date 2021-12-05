<script> 
	export let x = ['a', 'b', 'c'];
	export let data = {
		'a': 'A',
		'b': 'B',
		'c': 'C',
	};
	export function getData() {
		return data;
	}
</script>

{#each x as x}
	<input type=text bind:value={data[x]}>
{/each}