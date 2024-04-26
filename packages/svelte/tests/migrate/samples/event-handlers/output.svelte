<script>
	let { onclick, ontoggle, 'custom-event-bubble': oncustom_event_bubble } = $props();
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

<Button on:click={() => 'leave untouched'} on:click>click me</Button>