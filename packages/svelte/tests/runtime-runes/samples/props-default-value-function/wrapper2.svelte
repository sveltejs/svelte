<script >
  import Inner from "./inner.svelte";

  const { getter = $bindable(() => -1)} = $props();
</script>

<Inner {getter} />
