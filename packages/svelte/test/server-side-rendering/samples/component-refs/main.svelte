<script>
	export let widget;

	import Widget from './Widget.svelte';
</script>

<div><Widget bind:this={widget}/></div>
