<script lang="ts">
	let { x, push }: {
		x: number;
		push: (label: string, v: number) => Promise<number>;
	} = $props();

	let v = $derived(await push('v', x));

	console.log(`continued with ${v}`);
</script>

<span>{v}</span>
