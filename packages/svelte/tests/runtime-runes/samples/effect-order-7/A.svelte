<script>
	import B from './B.svelte';

	let { boolean, closed, close } = $props();
</script>

<span>{boolean} {closed}</span>

<B {closed} {close} />
