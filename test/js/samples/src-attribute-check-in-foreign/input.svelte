<svelte:options namespace="foreign" />

<script>
	export let url;
</script>

<svg>
	<img alt="potato" src={url}>
</svg>
