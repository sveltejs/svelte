<script>
	let activeTab = 0;
	let activeHeading;

	$: console.log(activeHeading);
</script>

<div class="tabs">
	<div class="tab-toggles">
		<button class:active={activeTab === 0} on:click={() => activeTab = 0}>Tab 1</button>
		<button class:active={activeTab === 1} on:click={() => activeTab = 1}>Tab 2</button>
		<button class:active={activeTab === 2} on:click={() => activeTab = 2}>Tab 3</button>
	</div>
	<div class="tab-content">
		{#if activeTab === 0}
			<div><h1 bind:this={activeHeading}>Tab 1</h1></div>
		{/if}
		{#if activeTab === 1}
			<div><h1 bind:this={activeHeading}>Tab 2</h1></div>
		{/if}
		{#if activeTab === 2}
			<div><h1 bind:this={activeHeading}>Tab 3</h1></div>
		{/if}
	</div>
	<duiv>
</div>
