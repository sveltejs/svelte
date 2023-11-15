<script>
  import Nested from "./Nested.svelte";
  import Leaf from "./Leaf.svelte";
</script>

<Nested value="bar">
  <Leaf />
</Nested>

<Nested>
  <Leaf />
</Nested>
