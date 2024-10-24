<script>
	let {prop = '', children} = $props()
</script>

<div>{prop}{@render children()}</div>