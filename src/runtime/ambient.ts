declare module '*.svelte' {
	type SvelteComponent = typeof import('./internal/ComponentApi').SvelteComponentApi
	export default SvelteComponent
}
