<script>
	import { untrack } from 'svelte';

	let count = $state(0);
	function default_arg() {
		untrack(() => count++);
		return 1;
	}
</script>

{#snippet item(id = default_arg())}
	<div>{id} {id} {id}</div>
{/snippet}

{@render item()}
{@render item(2)}
{@render item()}
<p>{count}</p>
