<script>
	export let a;
	export let b;
</script>
<div>{a}</div>
<div>{b}</div>
<input type="number" bind:focused={a} onclick='{e => e.target.focus()}' />
<input type="number" bind:focused={b} onclick='{e => e.target.focus()}' />
<button onclick='{e => e.target.focus()}'>click</button>
