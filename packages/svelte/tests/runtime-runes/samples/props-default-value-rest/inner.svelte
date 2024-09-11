<script>
  let { options = $bindable('foo') } = $props();

  options = 'bar'
</script>

{options}
