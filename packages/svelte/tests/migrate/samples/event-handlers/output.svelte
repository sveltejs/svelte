<script>
	import { createBubbler, handlers, preventDefault, stopPropagation, stopImmediatePropagation, self, trusted, once, passive, nonpassive } from 'svelte/legacy';
	
	const bubble = createBubbler();
</script>

<button onclick={handlers(() => console.log('hi'), bubble('click'))}>click me</button>
<button onclick={handlers(function(){ console.log('hi') }, bubble('click'))}>click me</button>
<button onclick={handlers(() => console.log('before'), bubble('click'), () => console.log('after'))}
	>click me</button
>
<button onclick={handlers(bubble('click'), foo)}>click me</button>
<button onclick={bubble('click')}>click me</button>

<button ondblclick={() => console.log('hi')}>click me</button>
<button ontoggle={bubble('toggle')}>click me</button>
<button oncustom-event={() => 'hi'}>click me</button>
<button oncustom-event-bubble={bubble('custom-event-bubble')}>click me</button>

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
<button onclick={trusted(self(() => ''))}>click me</button>
<button onclick={once(trusted(() => ''))}>click me</button>
<button onclick={once(preventDefault(() => ''))}>click me</button>

<button use:passive={['click', () => bubble('click')]}>click me</button>
<button use:nonpassive={['click', () => bubble('click')]}>click me</button>
<button use:passive={['click', () => ()=>'']}>click me</button>
<button use:nonpassive={['click', () => ()=>'']}>click me</button>
<button use:passive={['click', () => foo]}>click me</button>
<button use:nonpassive={['click', () => foo]}>click me</button>
<button use:passive={['click', () => stopPropagation(()=>'')]}>click me</button>
<button use:nonpassive={['click', () => trusted(()=>'')]}>click me</button>

<button
	use:passive={['click', () => ()=>'']}
	onclick={handlers(bubble('click'), ()=>'')}
>click me</button>

<button
	use:nonpassive={['click', () => ()=>'']}
	onclick={handlers(bubble('click'), ()=>{
		return 'multiline';
	})}
>click me</button>


<button
	onclick={handlers(bubble('click'), foo, ()=>'', once(trusted(preventDefault(()=>''))))}
	onblur={handlers(foo, once(trusted(preventDefault(bubble('blur')))))}
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
