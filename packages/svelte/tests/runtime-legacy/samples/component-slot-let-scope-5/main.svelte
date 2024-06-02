<script>
	import Nested from "./Nested.svelte"
	import Nested2 from "./Nested2.svelte"
</script>

<Nested>
	<Nested2 slot="inner" let:text>
		<div slot="footer">
			{@const text2 = text}
			{text} {text2}
		</div>
	</Nested2>
</Nested>