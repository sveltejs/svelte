<script>
	import { onDestroy } from "svelte";

	let {
        clazz = 'custom',
        foo = true,
        bar = true,
        browser
    } = $props();

    let mutations = [];
    let observer;

    if (browser) {
		observer = new MutationObserver(updateMutationRecords);
        const main = document.querySelector('main#main');
        if (main) {
            observer.observe(main, { attributes: true, subtree: true });
        }
        
	}
    

    function updateMutationRecords(results) {
        for (const r of results) {
			mutations.push(r.target.nodeName);
		}
    }

    export function get_and_clear_mutations() {
        updateMutationRecords(observer.takeRecords());
        const result = mutations;
        mutations = [];
        return result;
    }

    onDestroy(() => { if (observer) observer.disconnect(); });

</script>

<main id="main" class:browser>
	<div class={clazz} class:foo class:bar></div>
	<span class:foo class:bar></span>
	<b class={clazz} class:foo class:bar></b>
	<i class:foo class:bar></i>
</main>

<style>
	div,
	span {
		color: red;
	}
</style>
