<script>
  function innerCall() {
    console.log('inner call');
  }
</script>
<slot name="inner_slot" {innerCall} />