<script lang="ts">
	let { promise, name }: { promise: Promise<number>; name: string } = $props();

	let value = $derived(await promise);
	console.log(`continued ${name} ${value}`);
</script>

<p>{name}: {value}</p>
