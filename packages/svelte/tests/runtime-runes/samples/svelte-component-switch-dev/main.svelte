<script>
	import A from './A.svelte';
	import B from './B.svelte';

	let component = $state(A);
</script>

<button onclick={() => (component = B)}>switch</button>
<svelte:component this={component} />
