export default {
	skip_if_ssr: true,
	skip_if_hydrate_from_ssr: true,
	get props() {
		return { selected: false };
	},
	error: 'component is not a constructor'
};
