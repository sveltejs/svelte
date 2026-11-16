<script lang="ts">
	let { count, push }: {
		count: number;
		push: (site: string, value: number) => Promise<number>;
	} = $props();

	const shown = $derived(await push('first', count + 1));
	const held = $derived(await push('second', shown + 1));
</script>

{held}
