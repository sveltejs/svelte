<script>
	import {SvelteSet} from "svelte/reactivity";
	const ids = [0,1,2];
	const seenIds = new SvelteSet();

	const unseenIds = $derived(ids.filter((id) => !seenIds.has(id)));
	
	const currentId = $derived(unseenIds.at(0));
	$inspect(unseenIds)
</script>

<button onclick={() => seenIds.add(currentId)}>
	first unseen: {currentId}
</button>
