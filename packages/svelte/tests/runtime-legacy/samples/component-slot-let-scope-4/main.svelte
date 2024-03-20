<script>
	import Nested from "./Nested.svelte"
	import Nested2 from "./Nested2.svelte"
</script>

<Nested>
	<Nested2 slot="inner" let:text {text}>
		<div slot="footer">
			{text}
		</div>
	</Nested2>
</Nested>