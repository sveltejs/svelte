<script>
	import Nested from './Nested.svelte';

	export let obj = {a: 1, b: 42}
	export let c = 5
	export let d = 10
</script>

<Nested {obj} {c} {d} let:a let:b let:c let:d>
	<p>{a}</p>
	<p>{b}</p>
	<p>{c}</p>
	<p>{d}</p>
</Nested>