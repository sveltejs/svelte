<script>
	export let storeContainer;

	$: ({ store } = storeContainer);
	$: value = $store;
</script>
<div>{value}</div>
<div>{$store}</div>
