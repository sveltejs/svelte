import { Validator } from '../../';
import { Node } from '../../../interfaces';
import getName from '../../../utils/getName';
import { parse } from 'acorn';

export default function checkForValidIdentifiers(
	validator: Validator,
	properties: Node[]
) {
	properties.forEach(prop => {
    const name = getName(prop.key);
    const functionDefinitionString = `function ${name}() {}`;
    try {
      parse(functionDefinitionString);
    } catch(exception) {
      const invalidCharacter = functionDefinitionString[exception.pos]
      validator.error(`Computed property name "${name}" is invalid. Character '${invalidCharacter}' at position ${exception.pos} is illegal in function identifiers`, prop.start);
    }

	});
}
