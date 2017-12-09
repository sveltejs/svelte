import Element from './Element/Element';
import IfBlock from './IfBlock';
import MustacheTag from './MustacheTag';
import RawMustacheTag from './RawMustacheTag';
import { Visitor } from '../interfaces';

const visitors: Record<string, Visitor> = {
	Element,
	IfBlock,
	MustacheTag,
	RawMustacheTag
};

export default visitors;