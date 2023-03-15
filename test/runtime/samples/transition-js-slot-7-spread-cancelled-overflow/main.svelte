<script>
	import Nested from './Nested.svelte';

	export let a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,a10=0,a11=0, a12=0,a13=0,a14=0,a15=0,a16=0,a17=0,a18=0,a19=0,a20=0,a21=0, a22=0,a23=0,a24=0,a25=0,a26=0,a27=0,a28=0,a29=0,a30=0,a31=0,a32=0,a33=0;

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

{a1+a2+a3+a4+a5+a6+a7+a8+a9+a10+a11+a12+a13+a14+a15+a16+a17+a18+a19+a20+a21+a22+a23+a24+a25+a26+a27+a28+a29+a30+a31+a32+a33}