<script>
	import { onMount } from 'svelte';
  import Inner from './inner.svelte';

  let target;
  onMount(() => {
    new Inner({ target, props: {num: 1}})
  })
</script>

<div bind:this={target}></div>