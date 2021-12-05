<script>
	import A from './A.svelte';
	export let x = 1;
</script>

<A {x} let:reflected>
	<span>{reflected}</span>
</A>