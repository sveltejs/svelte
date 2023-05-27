<script>
  let foo = 0;
  function handleClick() {
    var random = 4;
    foo += random;
  }
</script>

<button on:click={handleClick} />
<p>{foo}</p>
