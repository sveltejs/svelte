<script>
	import { setContext } from 'svelte';
  setContext('a', 1);
  setContext('b', 2);
  setContext('c', 3);
</script>

<slot></slot>