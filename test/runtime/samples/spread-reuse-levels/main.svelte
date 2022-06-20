<script>
	import Nested from './Nested.svelte';

	export let a = 1;
	let x = {};
</script>

<Nested {...x} {a} b={[1]} c={42}/>