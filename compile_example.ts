import { compile } from "./src/compiler/index.ts";

const src = `
<script>
	export let environment = "Deno";
</script>

<style>
	body { color: pink; }
</style>

<p>Looks like Svelte compiler works on {environment}!</p>
`
const compiledSsr = compile(src, {
	filename: 'Deno.svelte',
	generate: 'ssr',
	name: 'Deno',
	sveltePath: "./svelte",
});

console.log("===SSR===")
console.log(compiledSsr.js.code)
console.log("=========")

const compiledDom = compile(src, {
	filename: "Deno.svelte",
	generate: 'dom',
	name: "Deno",
	sveltePath: "./svelte",
});

console.log("===DOM===")
console.log(compiledDom.js.code)
console.log("=========")
