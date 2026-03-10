<script>
	import { store } from './store.svelte.js';

	let counter = $state(0);
</script>

<button onclick={() => store.open()}>Open</button>
<button onclick={() => store.close()}>Close</button>
<button onclick={() => counter++}>Counter: {counter}</button>

<div
	class="panel"
	style:width={store.active && store.panelWidth ? `${store.panelWidth}px` : null}
>
	{#if store.active}
		open (width: {store.panelWidth})
	{:else}
		closed
	{/if}
</div>
