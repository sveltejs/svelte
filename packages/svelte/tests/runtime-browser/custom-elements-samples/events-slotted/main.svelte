<svelte:options customElement="custom-element" />

<button onclick={(e)=>{
	$host().callback();
}}>
	<slot></slot>
</button>
