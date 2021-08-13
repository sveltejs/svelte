<script>
  import Nested from "./Nested.svelte";
  import Delete from "./Delete.svelte";
  import Leaf from "./Leaf.svelte";
</script>

<Nested>
	<Delete>
		<Leaf>
			<Delete />
		</Leaf>
	</Delete>
</Nested>
