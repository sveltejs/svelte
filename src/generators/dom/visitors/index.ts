import AwaitBlock from './AwaitBlock';
import EachBlock from './EachBlock';
import Element from './Element/Element';
import IfBlock from './IfBlock';
import MustacheTag from './MustacheTag';
import RawMustacheTag from './RawMustacheTag';
import Text from './Text';
import { Visitor } from '../interfaces';

const visitors: Record<string, Visitor> = {
	AwaitBlock,
	EachBlock,
	Element,
	IfBlock,
	MustacheTag,
	RawMustacheTag,
	Text
};

export default visitors;