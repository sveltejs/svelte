<script lang="ts">
	let color = $state<string | null>('red');
	let size = $state(1);
	let base = $state('margin: 0');
</script>

<div style={base} style:color style:--size={size} style:background-image|important={'url("a;b.png")'}></div>

<button onclick={() => (color = color ? null : 'red')}>color</button>
<button onclick={() => size++}>size</button>
<button onclick={() => (base = base === 'margin: 0' ? 'padding: 1px' : 'margin: 0')}>base</button>
