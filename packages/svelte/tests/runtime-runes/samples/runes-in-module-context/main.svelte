<script module>
  function createCounter() {
    let count = $state(0);
    let double = $derived(count * 2);
    return {
      get count() { return count },
      set count(value) { count = value },
      get double() { return double },
    }
  }
</script>

<script>
  const counter = createCounter();
</script>


<button on:click={() => counter.count++}>{counter.double}</button>
