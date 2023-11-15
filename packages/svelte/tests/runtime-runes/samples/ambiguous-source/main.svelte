<script>
  import { setup } from './utils.js';

  let { num } = $state(setup());
</script>

<button on:click={() => num++}>{num}</button>
