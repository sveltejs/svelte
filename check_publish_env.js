if (!process.env.PUBLISH) {
	console.error('npm publish must be run with the PUBLISH environment variable set');
	process.exit(1);
}
