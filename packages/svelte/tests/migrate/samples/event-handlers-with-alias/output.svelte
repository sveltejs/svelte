<script>
	/** @type {{onclick?: (event: any) => void, ontoggle?: (event: any) => void, 'oncustom-event-bubble'?: (event: any) => void, onblur?: (event: any) => void}} */
	let {
		onclick,
		ontoggle,
		'oncustom-event-bubble': oncustom_event_bubble,
		onblur
	} = $props();
	import { handlers as handlers_1, preventDefault, stopPropagation as stopPropagation_1, stopImmediatePropagation as stopImmediatePropagation_1, self as self_1, trusted as trusted_1, once as once_1 } from 'svelte/legacy';

	let handlers;
	let stopPropagation;
	let stopImmediatePropagation;
	let once;
	let trusted;
	let self;
</script>

<button onclick={handlers_1(
	() => console.log('hi'),
	(event)=>{onclick?.(event);})} >click me</button>
<button onclick={handlers_1(
	function(){ console.log('hi') },
	(event)=>{onclick?.(event);})} >click me</button>
<button onclick={handlers_1(
	() => console.log('before'),
	(event)=>{onclick?.(event);},
	() => console.log('after'))}  
	>click me</button
>
<button onclick={handlers_1(
	(event)=>{onclick?.(event);},
	foo)} >click me</button>
<button onclick={(event)=>{onclick?.(event);}}>click me</button>

<button ondblclick={() => console.log('hi')}>click me</button>
<button ontoggle={(event)=>{ontoggle?.(event);}}>click me</button>
<button oncustom-event={() => 'hi'}>click me</button>
<button oncustom-event-bubble={(event)=>{oncustom_event_bubble?.(event);}}>click me</button>

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
		(event)=>{onclick?.(event);},
		foo,
		()=>'',
		once_1(preventDefault(trusted_1(()=>''))))}
	onblur={handlers_1(
		foo,
		
		once_1(
		preventDefault(
		trusted_1((event)=>{onblur?.(event);}))))}
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