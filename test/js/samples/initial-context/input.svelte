<script>
  let foo;
  function unreferenced () {
    foo = 1;
  }
</script>
<button on:click={() => foo = 2}></button>