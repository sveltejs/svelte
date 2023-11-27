<script>
	let browser = typeof window !== 'undefined';
</script>

<a href={browser ? '/foo': '/bar'}>foo</a>
