import { test } from '../../test';

export default test({
	compile_warnings: false,
	html: '<p><div></div></p> <li><li></li></li> <td><td></td></td> <input><label></label></input> <img><label></label></img> <textarea><label></label></textarea> <group><script><label></label></script><style><label></label></style></group>'
});
