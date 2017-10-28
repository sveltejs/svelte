export default {
	skip: +(/^v(\d)/.exec(process.version)[0]) < 8
};
