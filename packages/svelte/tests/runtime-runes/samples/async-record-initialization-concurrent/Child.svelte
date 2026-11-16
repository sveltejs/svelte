<script lang="ts">
	let { count, value, slow }: {
		count: number;
		value: Promise<string>;
		slow: (value: number) => Promise<number>;
	} = $props();

	const shown = $derived(await value);
	const held = $derived(await slow(count));
</script>

<p>{shown} {held}</p>
