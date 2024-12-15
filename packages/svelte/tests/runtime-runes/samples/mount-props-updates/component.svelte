<script>
	let { foo, bar = 'bar', baz = $bindable(), buz = $bindable('buz') } = $props();
</script>

<button
	onclick={() => {
		foo = '1';
		bar = '2';
		baz = '3';
		buz = '4';
	}}>update</button
>

{foo}
{bar}
{baz}
{buz}
