<script>
  let { id, version, load } = $props();
  const data = $derived(await load(id, version));
  let count = $state(0);
  $effect(() => {
    console.log(`effect ran in ${id}, count = ${count}`);
  });
</script>
<p>{data}</p>
<button onclick={() => count++}>{id}: clicked {count}</button>
