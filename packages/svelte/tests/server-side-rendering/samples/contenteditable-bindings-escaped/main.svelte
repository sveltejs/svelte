<script>
	let data = $state("<scri"+"pt>alert('pwnd')</scr"+"ipt>");
</script>

<div contenteditable bind:innerText={data}></div>
<div contenteditable bind:textContent={data}></div>
<div contenteditable bind:innerHTML={data}></div>
