import { test } from '../../test';

export default test({
	html: `<div><label for="pet-select">Choose a pet 1:</label><select id="pet-select1" name="pets">
	<option value="">--Please choose an option--</option><option value="dog">Dog</option><option value="cat">Cat</option></select></div><div><label for="pet-select">Choose a pet 2:</label>
	<select id="pet-select2" name="pets"><option value="">--Please choose an option--</option><option value="dog">Dog</option><option value="cat">Cat</option></select></div>`
});
