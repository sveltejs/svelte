<script>
  let { x } = $props();
  const result = $derived(await x);
</script>

{result}
