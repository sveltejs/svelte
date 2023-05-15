<script>
  import Nested from "./Nested.svelte";
</script>

<Nested>
  <div slot="slot1">
    <div>
      <div slot="slot2" />
    </div>
  </div>
</Nested>
