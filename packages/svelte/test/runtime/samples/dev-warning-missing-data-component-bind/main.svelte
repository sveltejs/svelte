<script>
	import Foo from './Foo.svelte';

	let x = undefined;
	let w = 'w';
</script>

<Foo bind:w bind:x />