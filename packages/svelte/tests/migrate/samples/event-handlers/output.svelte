<script>
	import { listener } from 'svelte/legacy';
	/** @type {{onclick?: (event: any) => void, ontoggle?: (event: any) => void, 'oncustom-event-bubble'?: (event: any) => void}} */
	let { onclick, ontoggle, 'oncustom-event-bubble': oncustom_event_bubble } = $props();
</script>

<button use:listener={[() => console.log('hi'),"click"]} use:listener={[(event)=>{onclick?.(event);},"click"]}>click me</button>
<button use:listener={[() => console.log('before'),"click"]} use:listener={[(event)=>{onclick?.(event);},"click"]} use:listener={[() => console.log('after'),"click"]}
	>click me</button
>
<button use:listener={[(event)=>{onclick?.(event);},"click"]} use:listener={[foo,"click"]}>click me</button>
<button use:listener={[(event)=>{onclick?.(event);},"click"]}>click me</button>

<button use:listener={[() => console.log('hi'),"dblclick"]}>click me</button>
<button use:listener={[(event)=>{ontoggle?.(event);},"toggle"]}>click me</button>
<button use:listener={[() => 'hi',"custom-event"]}>click me</button>
<button use:listener={[(event)=>{oncustom_event_bubble?.(event);},"custom-event-bubble"]}>click me</button>

<button use:listener={[() => '',"click",["preventDefault"]]}>click me</button>
<button use:listener={[() => (searching = true),"click",["preventDefault"]]}>click me</button>
<button use:listener={[() => {},"click",["stopPropagation"]]}>click me</button>
<button use:listener={[() => '',"click",["stopImmediatePropagation"]]}>click me</button>
<button use:listener={[() => '',"click",["capture"]]}>click me</button>
<button use:listener={[() => '',"click",["self"]]}>click me</button>

<Button on:click={() => 'leave untouched'} on:click>click me</Button>

<div>
	<button
		use:listener={[() => {
			console.log('hi');
		},"click"]}>click me</button
	>
	<button
		use:listener={[() => {
			console.log('hi');
		},"click",["preventDefault"]]}>click me</button
	>
	<button use:listener={[() => (count += 1),"click",["preventDefault"]]}>click me</button>
</div>