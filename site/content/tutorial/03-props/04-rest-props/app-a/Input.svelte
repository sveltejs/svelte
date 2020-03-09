<script>
	export let value = '';

	$: ({ value, ...rest } = $$props);
</script>

<input bind:value {...rest} />