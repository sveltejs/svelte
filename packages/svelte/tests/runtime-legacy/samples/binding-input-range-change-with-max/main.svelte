<script>
  let value = 10;
  let max = 10;

  function change() {
    value = 20;
    max = 20;
  }
</script>

<button on:click={change} />
<input type="range" min="0" {max} bind:value />
<p>{value} of {max}</p>
