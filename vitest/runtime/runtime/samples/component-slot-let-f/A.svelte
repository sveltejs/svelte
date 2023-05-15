<script>
	import B from './B.svelte';
	export let x;
</script>

<B {x} let:reflected>
	<span>{reflected}</span>
	<slot {reflected} />
</B>