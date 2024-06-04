<script lang="ts">
	let obj = $state({ a: 0 });
	let count = $state(0);
	let doubled = $derived(count * 2);

	console.log(obj);
	console.log(count);
	console.log(doubled);

	// writes are okay
	count++;
	count = 1;
	obj.a++;
	obj.a = 1;

	// `count` here is correctly identified as a non-reference
	let typed: { count: number } | null = null;

	// exports are okay as this is turned into a live reference
	export { count };
</script>

<button onclick={() => (count += 1)}>
	clicks: {count}
</button>
