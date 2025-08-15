<script>
	import A from './A.svelte';
	import B from './B.svelte';

	let condition = $state(true);
	let Component = $derived(condition ? A : B);
</script>

<button onclick={() => condition = !condition}>
	toggle ({condition})
</button>

<Component />
