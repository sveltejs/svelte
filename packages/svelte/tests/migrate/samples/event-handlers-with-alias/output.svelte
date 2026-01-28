<script>
	import { createBubbler as createBubbler_1, handlers as handlers_1, preventDefault as preventDefault_1, stopPropagation as stopPropagation_1, stopImmediatePropagation as stopImmediatePropagation_1, self as self_1, trusted as trusted_1, once as once_1, passive as passive_1, nonpassive as nonpassive_1 } from 'svelte/legacy';

	const bubble_1 = createBubbler_1();
	let handlers;
	let stopPropagation;
	let preventDefault;
	let stopImmediatePropagation;
	let once;
	let trusted;
	let self;
	let createBubbler;
	let bubble;
	let passive;
	let nonpassive;
</script>

<button onclick={handlers_1(() => console.log('hi'), bubble_1('click'))}>click me</button>
<button onclick={handlers_1(function(){ console.log('hi') }, bubble_1('click'))}>click me</button>
<button onclick={handlers_1(() => console.log('before'), bubble_1('click'), () => console.log('after'))}
	>click me</button
>
<button onclick={handlers_1(bubble_1('click'), foo)}>click me</button>
<button onclick={bubble_1('click')}>click me</button>

<button ondblclick={() => console.log('hi')}>click me</button>
<button ontoggle={bubble_1('toggle')}>click me</button>
<button oncustom-event={() => 'hi'}>click me</button>
<button oncustom-event-bubble={bubble_1('custom-event-bubble')}>click me</button>

<button onclick={preventDefault_1(() => (searching = true))}>click me</button>
<button onclick={preventDefault_1(() => '')}>click me</button>
<button onclick={stopPropagation_1(() => {})}>click me</button>
<button onclick={stopImmediatePropagation_1(() => '')}>click me</button>
<button onclickcapture={() => ''}>click me</button>
<button onclick={self_1(() => '')}>click me</button>
<button onclick={trusted_1(() => '')}>click me</button>
<button onclick={once_1(() => '')}>click me</button>

<button onclick={stopPropagation_1(preventDefault_1(() => ''))}>click me</button>
<button onclick={stopImmediatePropagation_1(stopPropagation_1(() => {}))}>click me</button>
<button onclick={self_1(stopImmediatePropagation_1(() => ''))}>click me</button>
<button onclick={trusted_1(self_1(() => ''))}>click me</button>
<button onclick={once_1(trusted_1(() => ''))}>click me</button>
<button onclick={once_1(preventDefault_1(() => ''))}>click me</button>

<button use:passive_1={['click', () => bubble_1('click')]}>click me</button>
<button use:nonpassive_1={['click', () => bubble_1('click')]}>click me</button>
<button use:passive_1={['click', () => ()=>'']}>click me</button>
<button use:nonpassive_1={['click', () => ()=>'']}>click me</button>
<button use:passive_1={['click', () => foo]}>click me</button>
<button use:nonpassive_1={['click', () => foo]}>click me</button>
<button use:passive_1={['click', () => stopPropagation_1(()=>'')]}>click me</button>
<button use:nonpassive_1={['click', () => trusted_1(()=>'')]}>click me</button>

<button 
	use:passive_1={['click', () => ()=>'']}
	onclick={handlers_1(bubble_1('click'), ()=>'')}
>click me</button>

<button 
	use:nonpassive_1={['click', () => ()=>'']}
	onclick={handlers_1(bubble_1('click'), ()=>'')}
>click me</button>


<button
	onclick={handlers_1(bubble_1('click'), foo, ()=>'', once_1(trusted_1(preventDefault_1(()=>''))))}
	onblur={handlers_1(foo, once_1(trusted_1(preventDefault_1(bubble_1('blur')))))}
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
		onclick={preventDefault_1(() => {
			console.log('hi');
		})}>click me</button
	>
	<button onclick={preventDefault_1(() => (count += 1))}>click me</button>
</div>