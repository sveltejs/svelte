<script>
	let show = $state(true);
	let must_throw = $state(false);
	let reset;
	let element;
	let errors = $state([]);
	let reset_during_cleanup = false;

	function throw_error() {
		throw new Error('boom');
	}

	function toggle() {
		must_throw = false;
		show = !show;
	}

	function reset_on_cleanup(_, reset_boundary) {
		return {
			destroy() {
				if (reset_during_cleanup) reset_boundary();
			}
		};
	}

	function track_render() {
		console.log('render');
	}
</script>

<button onclick={() => (must_throw = true)}>error</button>
<button onclick={toggle}>toggle</button>
<button onclick={() => reset()}>reset</button>
<button onclick={() => { reset_during_cleanup = true; toggle(); }}>destroy</button>
<p>{errors.join(',')}</p>

{#if show}
	<svelte:boundary onerror={(error, fn) => { errors.push(error.message); reset = fn; }}>
		{track_render()}
		<input bind:this={element} />
		{must_throw ? throw_error() : ''}

		{#snippet failed(_, failed_reset)}
			<input bind:this={element} use:reset_on_cleanup={failed_reset} />
		{/snippet}
	</svelte:boundary>
{/if}
