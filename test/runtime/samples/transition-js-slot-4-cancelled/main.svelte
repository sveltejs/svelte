<script>
	import Nested from './Nested.svelte';

	let visible = true;
	let state = 'Foo';
	let slotProps = 'Foo';
	export let props;

	export function show() {
		visible = true;
	}
	export function hide() {
		visible = false;
		state = 'Bar';
		slotProps = 'Bar';
	}
</script>

<div>outside {state} {props} {slotProps}</div>
<Nested {visible} {slotProps} let:slotProps>
	inside {state} {props} {slotProps}
</Nested>
