<script lang="ts">
	let obj = $state({ a: 0 });
	let count = $state(0);
	let doubled = $derived(count * 2);
	let tripled = $state(count * 3);

	console.log(obj);
	console.log(count);
	console.log(doubled);

	let {
		prop,
		other_prop = prop
	} = $props();
	let prop_state = $state(prop);
	let prop_derived = $derived(prop);
	console.log(prop);
	console.log(prop_derived);

	// writes are okay
	count++;
	count = 1;
	obj.a++;
	obj.a = 1;
	prop_state = 1;
	prop_derived = 1;

	// `count` here is correctly identified as a non-reference
	let typed: { count: number } | null = null;

	// exports are okay as this is turned into a live reference
	export { count };
</script>

<button onclick={() => (count += 1)}>
	clicks: {count}
</button>
