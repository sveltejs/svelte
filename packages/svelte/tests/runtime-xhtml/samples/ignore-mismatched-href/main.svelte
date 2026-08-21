<script>
	let { browser } = $props();
</script>

<link href={browser ? '/foo' : '/bar'} />
