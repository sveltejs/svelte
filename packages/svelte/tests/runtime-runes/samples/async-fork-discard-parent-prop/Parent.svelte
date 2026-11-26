<script lang="ts">
	import Child from './Child.svelte';

	let { x, load }: { x: number; load: (value: number) => Promise<number> } = $props();

	const a = $derived(await load(x));
</script>

<Child {a} {load} />
