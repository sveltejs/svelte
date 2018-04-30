import clorox from 'clorox';

function stderr(msg) {
	console.error(msg); // eslint-disable-line no-console
}

export default function error(err) {
	stderr(`${clorox.red(err.message || err)}`);

	if (err.frame) {
		stderr(err.frame); // eslint-disable-line no-console
	} else if (err.stack) {
		stderr(`${clorox.grey(err.stack)}`);
	}

	process.exit(1);
}
