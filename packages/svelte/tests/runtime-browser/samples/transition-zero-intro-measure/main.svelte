<script lang="ts">
	let visible = $state(false);
	let log = $state<string[]>([]);

	function parent_intro(node: HTMLElement) {
		log.push(`parent measure: ${getComputedStyle(node).height}`);
		return { duration: 400 };
	}

	function child_intro(node: HTMLElement) {
		log.push('child options');
		return {
			duration: 0,
			tick: (t: number) => {
				node.style.height = '100px';
				log.push(`child tick: ${t}`);
			}
		};
	}
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<div in:parent_intro>
		<div
			style="height: 20px"
			in:child_intro|global
			onintrostart={() => log.push('child start')}
			onintroend={() => log.push('child end')}
		>child</div>
	</div>
{/if}

<output>{log.join(', ')}</output>
