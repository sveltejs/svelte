<script lang="ts">
	let { count, push }: {
		count: number;
		push: (value: number) => Promise<number>;
	} = $props();

	const first = $derived(await push(count + 1));
	// `count` is never nullish, so the earlier deriveds aren't read, but referencing
	// them prevents parallel creation and keeps the script continuation in three steps
	const second = $derived(await push((count ?? first) + 2));
	const third = $derived(await push((count ?? second) + 3));
</script>

<p>{first} {second} {third}</p>
