<script>
	let obj = $state({ a: 0 });
	let count = $state(0);
	let doubled = $derived(count * 2);

	console.log(obj);
	console.log(count);
	console.log(doubled);
	// these are ok because they're writes
	count++;
	count = 1;
	obj.a++;
	obj.a = 1;
</script>

<button onclick={() => count += 1}>
	clicks: {count}
</button>
