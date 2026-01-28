<script>
	let {
		margin = null,
		color = 'red',
		fontSize = '18px',
		style1 = 'border: 1px solid',
		style2 = 'border: 1px solid; margin: 1em',
		style3 = 'color:blue; border: 1px solid; color: green;',
		style4 = 'background:blue; background: linear-gradient(0, white 0%, red 100%)',
		style5 = 'border: 1px solid; /* width: 100px; height: 100%; color: green */',
		style6 = 'background: url(https://placehold.co/100x100?text=;&font=roboto);',
		style7 = 'background: url("https://placehold.co/100x100?text=;&font=roboto");',
		style8 = "background: url('https://placehold.co/100x100?text=;&font=roboto');",
		
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

<main id="main" style:color={browser?'white':'black'}>
	<div style:margin style:color style:font-size|important={fontSize}></div>
	<div style={style1} style:margin style:color style:font-size|important={fontSize}></div>
	<div style={style2} style:margin style:color style:font-size|important={fontSize}></div>
	<div style={style3} style:margin style:color style:font-size|important={fontSize}></div>
	<div style={style4} style:margin style:color style:font-size|important={fontSize}></div>
	<div style={style5} style:margin style:color style:font-size|important={fontSize}></div>
	<div style={style6} style:margin style:color style:font-size|important={fontSize}></div>
	<div style={style7} style:margin style:color style:font-size|important={fontSize}></div>
	<div style={style8} style:margin style:color style:font-size|important={fontSize}></div>
</main>
