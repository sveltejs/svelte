<script>
	import { handlers, createBubbler, preventDefault, stopPropagation, stopImmediatePropagation, self, trusted, once } from 'svelte/legacy';

	const bubble = createBubbler();

	/** @type {{onclick?: (event: any) => void, ontoggle?: (event: any) => void, 'oncustom-event-bubble'?: (event: any) => void, onblur?: (event: any) => void}} */
	let {
		onclick = bubble('click'),
		ontoggle = bubble('toggle'),
		'oncustom-event-bubble': oncustom_event_bubble = bubble('custom-event-bubble'),
		onblur = bubble('blur')
	} = $props();
</script>

<button onclick={handlers(
	() => console.log('hi'),
	onclick)} >click me</button>
<button onclick={handlers(
	function(){ console.log('hi') },
	onclick)} >click me</button>
<button onclick={handlers(
	() => console.log('before'),
	onclick,
	() => console.log('after'))}  
	>click me</button
>
<button onclick={handlers(
	onclick,
	foo)} >click me</button>
<button {onclick}>click me</button>

<button ondblclick={() => console.log('hi')}>click me</button>
<button ontoggle={ontoggle}>click me</button>
<button oncustom-event={() => 'hi'}>click me</button>
<button oncustom-event-bubble={oncustom_event_bubble}>click me</button>

<button onclick={preventDefault(() => (searching = true))}>click me</button>
<button onclick={preventDefault(() => '')}>click me</button>
<button onclick={stopPropagation(() => {})}>click me</button>
<button onclick={stopImmediatePropagation(() => '')}>click me</button>
<button onclickcapture={() => ''}>click me</button>
<button onclick={self(() => '')}>click me</button>
<button onclick={trusted(() => '')}>click me</button>
<button onclick={once(() => '')}>click me</button>

<button onclick={stopPropagation(preventDefault(() => ''))}>click me</button>
<button onclick={stopImmediatePropagation(stopPropagation(() => {}))}>click me</button>
<button onclick={self(stopImmediatePropagation(() => ''))}>click me</button>
<button onclick={trusted(self(() => ''))}>click me</button>
<button onclick={once(trusted(() => ''))}>click me</button>
<button onclick={once(preventDefault(() => ''))}>click me</button>

<button
	onclick={handlers(
		onclick,
		foo,
		()=>'',
		once(preventDefault(trusted(()=>''))))}
	onblur={handlers(
		foo,
		once(preventDefault(trusted(onblur))))}
>
	click me
</button>


<Button on:click={() => 'leave untouched'} on:click>click me</Button>

<div>
	<button
		onclick={() => {
			console.log('hi');
		}}>click me</button
	>
	<button
		onclick={preventDefault(() => {
			console.log('hi');
		})}>click me</button
	>
	<button onclick={preventDefault(() => (count += 1))}>click me</button>
</div>