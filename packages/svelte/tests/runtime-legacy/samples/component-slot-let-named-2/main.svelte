<script>
	import Nested from './Nested.svelte';
	import SlotInner from './SlotInner.svelte';

	export let things;
</script>

<Nested {things}>
	<SlotInner slot="foo" let:thing={data} thing={data}>
		<div class="inner-slot">{data}</div>
	</SlotInner>
</Nested>
