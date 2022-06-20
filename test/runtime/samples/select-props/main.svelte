<script>
	export let foo = [ 1, 2 ];
	export let log = [];

	export function handler(bar) {
		log = log.concat(bar);
	}
</script>

{#each foo as bar}
	<select on:change='{() => handler(bar)}'>
		<option>a</option>
		<option>b</option>
	</select>
{/each}
