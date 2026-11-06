<script>
	let { set, wait } = $props();

	await wait();
	set(1);
</script>

<i>child</i>
