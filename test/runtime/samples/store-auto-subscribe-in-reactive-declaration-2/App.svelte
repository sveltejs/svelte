<script>
	export let store_container;

	$: ({ store } = store_container);
	$: value = $store;
</script>
<div>{value}</div>
<div>{$store}</div>
