<script>
  import Bar from './Bar.svelte';
  let { count = $bindable() } = $props();
</script>

<button onclick={() => count++}>{count}</button>

<div><Bar {count} /></div>