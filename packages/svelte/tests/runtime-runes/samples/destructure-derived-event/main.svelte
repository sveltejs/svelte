<script>
	import { log } from './log.js';

	let structured = $state({
		handler() {
			log.push('works!')
		}
	});
</script>

{#if structured}
  {@const { handler } = structured}

  <button onclick={() => handler()}>click me</button>
{/if}
