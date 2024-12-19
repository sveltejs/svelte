<script>
	let condition = Math.random() < 0.5;
</script>

<p class={['used1']}></p>
<p class={[{ used2: true }]}></p>
<p class={{ used3: true }}></p>
<p class={{ 'used4 used5': true }}></p>
<p class={{ used6 }}></p>
<p class={[condition ? 'used7' : 'used8']}></p>
<p class={[condition && 'used9']}></p>

<style>
	.used1 { color: green; }
	.used2 { color: green; }
	.used3 { color: green; }
	.used4 { color: green; }
	.used5 { color: green; }
	.used6 { color: green; }
	.used7 { color: green; }
	.used8 { color: green; }
	.used9 { color: green; }

	.unused { color: red; }
</style>
