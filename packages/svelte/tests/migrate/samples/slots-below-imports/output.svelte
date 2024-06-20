<script>
	import Foo from './Foo.svelte';
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

{@render children?.()}
<Foo />