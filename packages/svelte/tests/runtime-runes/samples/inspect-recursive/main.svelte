<script>
	class Rect{
		x = $state();
		y = $state();

		constructor(x, y){
			this.x = x;
			this.y = y;
		}
	}

	class Node{
		pos = $state({ x: 0, y: 0 });
		rect = $derived(new Rect(this.pos.x, this.pos.y));

		constructor(pos){
			this.pos = pos;
		}
	}

	const nodes = $state([]);

	const rects = $derived(nodes.map(n => n.rect));

	$inspect(rects);
</script>

<button onclick={()=>{
	nodes.push(new Node({x: Math.floor(Math.random()*100), y: Math.floor(Math.random()*100)}));
}}>add</button>
<ul>
	{#each rects as rect}
		<li>{rect.x} - {rect.y}</li>
	{/each}
</ul>
