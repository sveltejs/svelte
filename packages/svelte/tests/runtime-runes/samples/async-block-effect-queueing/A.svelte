<script>
	let open = $state(false);
	let menuOptionsEl = $state(null);
</script>

<button onclick={() => open = !open}>
	toggle

		{#if open}
			<!-- bind:this uses effect, which is scheduled, causing queued_root_effects to be filled again -->
			<span bind:this={menuOptionsEl}>
				A
			</span>
		{/if}
</button>
