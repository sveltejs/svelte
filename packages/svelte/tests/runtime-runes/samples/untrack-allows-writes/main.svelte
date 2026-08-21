<script>
	import { untrack } from "svelte";

	let count = $state(0);
	let mirrored = $state(0);
	let double = $derived.by(() => {
		untrack(() => {
			mirrored = count;
		});
		return count * 2;
	})
</script>

<button onclick={() => count++}>{count} {mirrored} {double}</button>
