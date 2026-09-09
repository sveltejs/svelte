<script>
	import Nested from './Nested.svelte';
</script>

<Nested things={[1, 2]}>
	<div slot="foo" let:thing>
		{@const props = { thing }}
		<span>{props.thing}</span>
	</div>
</Nested>
