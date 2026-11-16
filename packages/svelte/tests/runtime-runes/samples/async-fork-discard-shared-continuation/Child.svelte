<script lang="ts">
	let { count, push }: {
		count: number;
		push: (site: string, value: number) => Promise<number>;
	} = $props();

	const first = $derived(await push('first', count + 1));
	const second = $derived(await push('second', count + 2));
	const third = $derived(await push('third', count + 3));
</script>

<p>{first} {second} {third}</p>
