<script lang="ts">
	let { count, push }: {
		count: number;
		push: (value: number) => Promise<number>;
	} = $props();

	const shown = $derived(await push(count + 1));
	const held = $derived(await push(shown + 1));
</script>

{held}
