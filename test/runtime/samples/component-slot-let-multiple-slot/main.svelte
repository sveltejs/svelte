<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:x>
	<p slot="a" let:a>{a} {x}</p>
	<p slot="a">{x}</p>

	<p slot="b">{x}</p>
	<p slot="b" let:b>{b} {x}</p>
</Nested>
