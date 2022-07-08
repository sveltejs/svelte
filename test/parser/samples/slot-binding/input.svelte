<script>
  import TestButton from './TestButton.svelte'
</script>

<TestButton let:outerCall>
  <button on:click={outerCall}>Click</button>
</TestButton>