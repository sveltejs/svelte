<script>
	import B from './B.svelte';

	let { boolean, closed } = $props();
</script>

<span>{boolean}</span>

<B {closed} />
