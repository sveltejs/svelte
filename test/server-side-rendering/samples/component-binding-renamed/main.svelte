<script>
	import Foo from './Foo.svelte';

	export let x;
	export let y;
</script>

{y}<Foo bind:x={y}/>{y}
