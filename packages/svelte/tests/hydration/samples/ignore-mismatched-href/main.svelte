<script>
	let { browser } = $props();
</script>

<a href={browser ? '/foo': '/bar'}>foo</a>
