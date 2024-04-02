<script>
  let thing = $state();

	function update() {
		let data = $state({ name: 1, position: 1 });
	  let position = $derived(data.position);
		let name = $derived(data.name);

		thing = {
			get data() { return data },
			get position() { return position },
			get name() { return name },
		}

		thing.position;
		data = { name: 2, position: 2 };
	}
</script>

<button onclick={update}>update</button>

<div>
	{thing?.data?.name}
</div>
<div>
	{thing?.name}
</div>
<div>
	{thing?.data?.position}
</div>
<div>
	{thing?.position}
</div>
