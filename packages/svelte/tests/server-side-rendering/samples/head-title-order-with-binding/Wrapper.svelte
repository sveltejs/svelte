<script>
	import B from './B.svelte';

	let value = $state();
</script>

<B bind:value />
