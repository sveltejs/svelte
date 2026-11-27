<script lang="ts">
	let show = $state(true);

	function fade(_node: Element, { delay = 0, duration = 400 } = {}) {
		return {
			delay,
			duration,
			css: (t: number) => `opacity: ${t}`
		};
	}

	function instant_tick(node: HTMLElement) {
		return {
			duration: 0,
			tick: (t: number) => {
				node.dataset.t = String(t);
			}
		};
	}
</script>

<button onclick={() => (show = !show)}>toggle</button>

<output>
	{#if show}
		<p out:fade={{ duration: 1000 }}>should fade out</p>
		<p out:fade={{ duration: 0 }}>should disappear immediately</p>
		<p out:fade={{ delay: 100, duration: 0 }}>should disappear after delay</p>
		<p out:instant_tick>should tick immediately</p>
	{/if}
</output>
