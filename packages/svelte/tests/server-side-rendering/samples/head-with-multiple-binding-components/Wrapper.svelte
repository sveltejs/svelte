<script>
	import Foo from './Foo.svelte';
	let bar = $state();
</script>

<Foo bind:bar />
