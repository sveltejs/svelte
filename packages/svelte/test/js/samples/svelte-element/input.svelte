<script>
	export let dynamic_value;
	export let dynamic_obj;
	let static_value = 'a';
	let static_obj = {};
</script>

<svelte:element this={static_value} {static_value} {...static_obj} class:foo={static_value} />

<svelte:element this={dynamic_value} {static_value} {...static_obj} class:foo={static_value} />

<svelte:element this={static_value} {dynamic_value} {...dynamic_obj} class:foo={dynamic_value} />

<svelte:element this={dynamic_value} {dynamic_value} {...dynamic_obj} class:foo={dynamic_value} />
