<script>
	let { children, push } = $props();
	let message = await push('hello from child');
</script>

<p>message: {message}</p>
{@render children()}
