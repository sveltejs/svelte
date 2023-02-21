export default {
	solo: true,
	skip_if_ssr: true,
	skip_if_hydrate: true,
	html: `
		<div>
			Top content
			<hr>
			Middle
			<hr>
			bottom fallback
		</div>
		<div>
			Top content
			<hr>
			Middle
			<hr>
			Bottom content
		</div>
		<div>
			top fallback
			<hr>
			Middle Content
			<hr>
			bottom fallback
		</div>
	`,
};
