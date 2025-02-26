<script>
	let {
		classname = 'custom',
		foo = true,
		bar = true,
		browser
	} = $props();

	let mutations = [];
	let observer;

	if (browser) {
		observer = new MutationObserver(update_mutation_records);
		observer.observe(document.querySelector('#main'), { attributes: true, subtree: true });

		$effect(() => {
			return () => observer.disconnect();
		});
	}

	function update_mutation_records(results) {
		for (const r of results) {
			mutations.push(r.target.nodeName);
		}
	}

	export function get_and_clear_mutations() {
		update_mutation_records(observer.takeRecords());
		const result = mutations;
		mutations = [];
		return result;
	}
</script>

<main id="main" class:browser>
	<div class={classname} title="a title" class:foo class:bar></div>
	<span class:foo class:bar></span>
	<b class={classname} class:foo class:bar></b>
	<i class:foo class:bar></i>

	<div {...{class:classname, title:"a title"}} class:foo class:bar></div>
	<span {...{}} class:foo class:bar></span>
	<b {...{class:classname}} class:foo class:bar></b>
	<i {...{}} class:foo class:bar></i>	
</main>

<style>
	div,
	span {
		color: red;
	}
</style>
