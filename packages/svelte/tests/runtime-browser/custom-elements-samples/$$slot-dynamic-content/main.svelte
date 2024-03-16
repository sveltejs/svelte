<!-- before Svelte 4 it was necessary to explicitly set customElement to null or else you'd get a warning. Keep this around for backwards compat -->
<svelte:options customElement={null} />

<script>
	import "./my-widget.svelte";
	export let name;
</script>

<my-widget>
	<p>default {name}</p>
</my-widget>
