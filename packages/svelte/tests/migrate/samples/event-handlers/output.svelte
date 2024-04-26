<script>
	/** @type {{onclick?: (payload: any) => void, ontoggle?: (payload: any) => void, 'oncustom-event-bubble'?: (payload: any) => void}} */
	let { onclick, ontoggle, 'oncustom-event-bubble': oncustom_event_bubble } = $props();
</script>

<button  onclick={(payload) => {
	console.log('hi')

	onclick?.(payload);
}}>click me</button>
<button   onclick={(payload_1) => {
	console.log('before')

	onclick?.(payload_1);
	console.log('after')
}}>click me</button>
<button  onclick={(payload_2) => {
	onclick?.(payload_2);

	foo?.(payload_2);
}}>click me</button>
<button {onclick}>click me</button>

<button ondblclick={() => console.log('hi')}>click me</button>
<button {ontoggle}>click me</button>
<button oncustom-event={() => 'hi'}>click me</button>
<button oncustom-event-bubble={oncustom_event_bubble}>click me</button>

<button onclick={(payload_8) => {
	payload_8.preventDefault();
	''
}}>click me</button>
<button onclick={(payload_9) => {
	payload_9.stopPropagation();
	''
}}>click me</button>
<button onclick={(payload_10) => {
	payload_10.stopImmediatePropagation();
	''
}}>click me</button>
<button onclickcapture={() => ''}>click me</button>
<button onclick={(payload_12) => {
	// @migration-task: incorporate self modifier
	''
}}>click me</button>

<Button on:click={() => 'leave untouched'} on:click>click me</Button>