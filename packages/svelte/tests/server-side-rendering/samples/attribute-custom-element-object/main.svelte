<script>
	let config = { title: 'hello' };
	let items = ['a', 'b'];
	let count = 2;
</script>

<x-card {config} {items} {count}></x-card>
<x-card {...{ config, items, count }}></x-card>
<div is="x-card-div" {config} {items} {count}></div>
