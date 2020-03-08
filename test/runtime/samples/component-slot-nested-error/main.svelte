<script>
	import Nested from "./Nested.svelte";
</script>

<Nested>
	<div slot="slot1">
		<div slot="slot2" />
	</div>
</Nested>
