<script>
	export let foo, bar;
</script>

<button on:click="{() => { foo = 4; bar = 2; }}">click me</button>

<p>foo: {foo}</p>
<p>bar: {bar}</p>