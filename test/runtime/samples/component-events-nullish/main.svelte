<script>
	import Widget from './Widget.svelte';
	export let logs = [];
</script>

<Widget on:click={null} {logs} />
