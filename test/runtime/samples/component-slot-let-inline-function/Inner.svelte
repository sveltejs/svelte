<script>
  export let log;
  export let b;
  function innerCall(a) {
    log(`a: ${a}, b: ${b}`);
  }
</script>
<slot name="inner_slot" {innerCall} />