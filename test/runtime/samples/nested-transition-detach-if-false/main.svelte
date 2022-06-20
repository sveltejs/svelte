<script>
	export let folder;

	import Folder from './Folder.svelte';
</script>

<Folder bind:this={folder} dir="a"/>