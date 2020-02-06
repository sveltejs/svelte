export default {
	compileOptions: {
		scopeClass({ hash }) {
			return `sv-${hash}`;
		}
	},
};
