<script lang="ts">
	let { count, push }: {
		count: number;
		push: (value: number) => Promise<number>;
	} = $props();

	const first = $derived(await push(count + 1));
	const second = $derived(await push(count + 2));
	const third = $derived(await push(count + 3));
</script>

<p>{first} {second} {third}</p>
