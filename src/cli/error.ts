import c from 'kleur';

function stderr(msg) {
	console.error(msg); // eslint-disable-line no-console
}

export default function error(err) {
	stderr(c.red(err.message || err));

	if (err.frame) {
		stderr(err.frame);
	} else if (err.stack) {
		stderr(c.gray(err.stack));
	}

	process.exit(1);
}
