<script>
	export let store;

	$: ({ undefinedProperty } = $store);
</script>

<span>{undefinedProperty}</span>
