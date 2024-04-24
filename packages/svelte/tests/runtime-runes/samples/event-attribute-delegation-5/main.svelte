<div onclick={() => console.log('outer div onclick')}>
	<div on:click={() => console.log('inner div on:click')}>
		<button onclick={() => console.log('button onclick')} on:click={() => console.log('button on:click')}>main</button>
	</div>
</div>
