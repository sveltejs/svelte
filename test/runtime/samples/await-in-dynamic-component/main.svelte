<script>
	export let flag = true;
	import Widget from './Widget.svelte';
</script>

<svelte:component this={flag && Widget}/>