<script>
  import Async from './Async.svelte';
  import Bar from './Bar.svelte';
  let x = $state(0);
  let y = $state(0);
</script>


<button onclick={() => {x++; queueMicrotask(() => queueMicrotask(() =>  y++))}}>increment</button>
<Async {x} />
<Bar {y} />
