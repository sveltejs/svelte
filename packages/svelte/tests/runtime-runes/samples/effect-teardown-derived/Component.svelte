<script>
	let { message, count } = $props();

	$effect(() => () => {
		console.log(count, message);
	});
</script>

<p>{count}</p>

<!-- we need these so that the props are made into deriveds -->
<button disabled onclick={() => {
	count += 1;
	message += '!';
}}>update</button>
