<script>
	import { untrack } from 'svelte';

	let count = $state(0);
	function default_arg() {
		untrack(() => count++);
		return 1;
	}
</script>

{#each [{}, { a: 2 }, {}] as { a = default_arg() }}
	<div>{a} {a} {a}</div>
{/each}
<p>{count}</p>
