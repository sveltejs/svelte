<script>
	let { foo, ...ok } = $props();
	let { bar, ...not_ok } = $props.bindable();
</script>
