<script>
	/** @type {{onclick?: (event: any) => void, ontoggle?: (event: any) => void, 'oncustom-event-bubble'?: (event: any) => void, onblur?: (event: any) => void}} */
	let {
		onclick = bubble_1('click'),
		ontoggle = bubble_1('toggle'),
		'oncustom-event-bubble': oncustom_event_bubble = bubble_1('custom-event-bubble'),
		onblur = bubble_1('blur')
	} = $props();
	import { handlers as handlers_1, createBubbler as createBubbler_1, preventDefault, stopPropagation as stopPropagation_1, stopImmediatePropagation as stopImmediatePropagation_1, self as self_1, trusted as trusted_1, once as once_1 } from 'svelte/legacy';
	const bubble_1 = createBubbler_1();


	let handlers;
	let stopPropagation;
	let stopImmediatePropagation;
	let once;
	let trusted;
	let self;
	let createBubbler;
	let bubble;
</script>

<button onclick={handlers_1(
	() => console.log('hi'),
	onclick)} >click me</button>
<button onclick={handlers_1(
	function(){ console.log('hi') },
	onclick)} >click me</button>
<button onclick={handlers_1(
	() => console.log('before'),
	onclick,
	() => console.log('after'))}  
	>click me</button
>
<button onclick={handlers_1(
	onclick,
	foo)} >click me</button>
<button {onclick}>click me</button>

<button ondblclick={() => console.log('hi')}>click me</button>
<button ontoggle={ontoggle}>click me</button>
<button oncustom-event={() => 'hi'}>click me</button>
<button oncustom-event-bubble={oncustom_event_bubble}>click me</button>

<button onclick={preventDefault(() => (searching = true))}>click me</button>
<button onclick={preventDefault(() => '')}>click me</button>
<button onclick={stopPropagation_1(() => {})}>click me</button>
<button onclick={stopImmediatePropagation_1(() => '')}>click me</button>
<button onclickcapture={() => ''}>click me</button>
<button onclick={self_1(() => '')}>click me</button>
<button onclick={trusted_1(() => '')}>click me</button>
<button onclick={once_1(() => '')}>click me</button>

<button onclick={stopPropagation_1(preventDefault(() => ''))}>click me</button>
<button onclick={stopImmediatePropagation_1(stopPropagation_1(() => {}))}>click me</button>
<button onclick={self_1(stopImmediatePropagation_1(() => ''))}>click me</button>
<button onclick={trusted_1(self_1(() => ''))}>click me</button>
<button onclick={once_1(trusted_1(() => ''))}>click me</button>
<button onclick={once_1(preventDefault(() => ''))}>click me</button>

<button
	onclick={handlers_1(
		onclick,
		foo,
		()=>'',
		once_1(preventDefault(trusted_1(()=>''))))}
	onblur={handlers_1(
		foo,
		once_1(preventDefault(trusted_1(onblur))))}
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