<script>
  import { setup } from './utils.js';

  let { num } = $state(setup());
  let { num: num_frozen } = $state(setup());
</script>

<button on:click={() => { num++; num_frozen++; }}>{num} / {num_frozen}</button>
