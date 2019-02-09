<script>
	import Foo from './Foo.svelte';

	export let x;
</script>

{x}<Foo bind:x/>{x}
