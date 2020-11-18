<script>
  import Nested from "./Nested.svelte";
</script>

<Nested>
  <div>
    <div>
      <div slot="slot2" />
    </div>
  </div>
</Nested>
