<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:count>
	<p>
		count in default slot: {count}
	</p>

	<p slot="foo" let:count>
		count in foo slot: {count}
	</p>

	<p slot="bar">
		count in bar slot: {count}
	</p>
</Nested>