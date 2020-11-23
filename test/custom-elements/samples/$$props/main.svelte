<svelte:options tag="custom-element"/>

<script>
	export let name;
</script>

<p>name: {name}</p>
<p>$$props: {JSON.stringify($$props)}</p>
<p>$$restProps: {JSON.stringify($$restProps)}</p>

