<script>
	const tabs = [
		{ id: 'tab1', label: 'Tab 1'},
		{ id: 'tab2', label: 'Tab 2' },
		{ id: 'tab3', label: 'Tab 3' }
	]
	
	let activeTab = $state('tab1')

	const doSomething = async () => {
		console.log('doSomething called')
	}
</script>

<nav>
	<ul>
		{#each tabs as tab (tab.id)}
			{@const switchTab = async () => {
				console.log('switchTab called', tab.id)
				activeTab = tab.id
				await doSomething()
			}}
			
			<button onclick={switchTab}>
				{tab.label}
			</button>
		{/each}
	</ul>
</nav>

{#if activeTab == 'tab1'}
	<h1>Tab 1</h1>
{:else if activeTab == 'tab2'}
	<h1>Tab 2</h1>
{:else if activeTab == 'tab3'}
	<h1>Tab 3</h1>
{/if}
