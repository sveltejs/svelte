<script lang="ts">
	let { begin, count, suffix, slow }: {
		begin: Promise<string>;
		count: number;
		suffix: string;
		slow: (value: number) => Promise<number>;
	} = $props();

	const label = $derived(await begin);
	let value = $derived((await slow(count)) + suffix);
</script>

<p>{label} {value}</p>
