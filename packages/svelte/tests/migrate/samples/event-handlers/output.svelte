<script>
	/** @type {{onclick?: (event: any) => void, ontoggle?: (event: any) => void, 'oncustom-event-bubble'?: (event: any) => void}} */
	let { onclick, ontoggle, 'oncustom-event-bubble': oncustom_event_bubble } = $props();
</script>

<button  onclick={(event) => {
	console.log('hi')

	onclick?.(event);
}}>click me</button>
<button   onclick={(event) => {
	console.log('before')

	onclick?.(event);
	console.log('after')
}}
	>click me</button
>
<button  onclick={(event) => {
	onclick?.(event);

	foo?.(event);
}}>click me</button>
<button {onclick}>click me</button>

<button ondblclick={() => console.log('hi')}>click me</button>
<button {ontoggle}>click me</button>
<button oncustom-event={() => 'hi'}>click me</button>
<button oncustom-event-bubble={oncustom_event_bubble}>click me</button>

<button onclick={(event) => {
	event.preventDefault();
	''
}}>click me</button>
<button onclick={(event) => {
	event.preventDefault();
	searching = true
}}>click me</button>
<button onclick={(event) => {
	event.stopPropagation();
	
}}>click me</button>
<button onclick={(event) => {
	event.stopImmediatePropagation();
	''
}}>click me</button>
<button onclickcapture={() => ''}>click me</button>
<button onclick={(event) => {
	// @migration-task: incorporate self modifier
	''
}}>click me</button>

<Button on:click={() => 'leave untouched'} on:click>click me</Button>

<div>
	<button
		onclick={() => {
			console.log('hi');
		}}>click me</button
	>
	<button
		onclick={(event) => {
			event.preventDefault();
			
			console.log('hi');
		
		}}>click me</button
	>
	<button onclick={(event) => {
		event.preventDefault();
		count += 1
	}}>click me</button>
</div>