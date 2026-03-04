<script >
  import Inner from "./inner.svelte";

  const { getter = () => -1} = $props();
</script>

<Inner {getter} />
