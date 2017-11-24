export default {
	skip: +(/^v(\d)/.exec(process.version)[1]) < 8
};
