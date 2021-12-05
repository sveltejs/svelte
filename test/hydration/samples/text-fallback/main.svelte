<script>
	import Nested from './Nested.svelte'
</script>

<Nested>
	<div slot="foo">
		foo override
	</div>

	default
</Nested>
