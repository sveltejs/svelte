<script>
	import {handler, log_b} from './event.js';
</script>

<button onclick={handler.value}>click</button>
<button onclick={() => handler.value = log_b}>change</button>
