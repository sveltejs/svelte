<script>
	import A from './A.svelte';

	export let currentIdentifier = 2;
</script>

<A bind:currentIdentifier />
<A bind:currentIdentifier />