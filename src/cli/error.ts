import clorox from 'clorox';

function stderr(msg) {
	console.error(msg); // eslint-disable-line no-console
}

export default function error(err) {
	stderr(`${clorox.red(err.message || err)}`);

	if (err.frame) {
		stderr(err.frame);
	} else if (err.stack) {
		stderr(`${clorox.gray(err.stack)}`);
	}

	process.exit(1);
}
