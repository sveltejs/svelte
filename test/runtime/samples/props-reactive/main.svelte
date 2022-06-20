<script>
	import Nested from './Nested.svelte';

	export let a;
	export let b;
	export let c;
	export let d;
</script>

<Nested foo={a} bar={b} baz={c} qux={d}/>