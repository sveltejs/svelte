export default function sanitize(name) {
	return name.replace(/[^a-zA-Z]+/g, '_').replace(/^_/, '').replace(/_$/, '');
}