<script>
	import { derived } from 'svelte/store';

	export let count;

	const doubled = derived(count, $count => $count * 2);
</script>

<button on:click="{() => $count += 1}">count {$count}</button>
<p>doubled: {$doubled}</p>