<script>
	import Nested from './Nested.svelte';

	export let obj;
	export let c;
	export let d;
</script>

<Nested {obj} {c} {d} let:a let:b let:c let:d>
	<p>{a}</p>
	<p>{b}</p>
	<p>{c}</p>
	<p>{d}</p>
</Nested>