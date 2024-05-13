<script>
	export let a;
	export function b() {}
	export let c = 1;

	$: length = Object.keys($$restProps).length;
	$: values = Object.values($$restProps);
</script>
<div>Length: {length}</div>
<div>Values: {values.join(',')}</div>

<div {...$$restProps}></div>
