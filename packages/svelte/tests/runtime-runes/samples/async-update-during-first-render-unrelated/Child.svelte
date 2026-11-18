<script lang="ts">
	let { count, answer }: {
		count: number;
		answer: Promise<string>;
	} = $props();

	const shown = $derived(await Promise.resolve('one'));
	const held = $derived(await answer);
</script>

<p>{shown} {held} {count}</p>
