<script>
	import Nested from './Nested.svelte';
	import Nested2 from './Nested2.svelte';

	let visible = true;
	let state = 'Foo';
	let slotProps = { slotProps: 'Foo' };
	export let props;

	export function show() {
		visible = true;
	}
	export function hide() {
		visible = false;
		state = 'Bar';
		slotProps = { slotProps: 'Bar' };
	}
</script>

<div>outside {state} {props} {slotProps.slotProps}</div>
<Nested {visible} {slotProps} let:slotProps>
	inside {state} {props} {slotProps}
</Nested>
<Nested2 {visible} let:slotProps>
	inside {state} {props} {slotProps}
</Nested2>
