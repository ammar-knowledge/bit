import {
  DocSchema,
  Location,
  Modifier,
  ParameterSchema,
  SchemaNode,
  SchemaRegistry,
  TagName,
} from '@teambit/semantics.entities.semantic-schema';
import chalk from 'chalk';

/**
 * function-like can be a function, method, arrow-function, variable-function, etc.
 */
export class ReactSchema extends SchemaNode {
  readonly returnType: SchemaNode;

  readonly props: ParameterSchema;

  readonly doc?: DocSchema;

  constructor(
    readonly location: Location,
    readonly name: string,
    props: ParameterSchema,
    returnType: SchemaNode,
    readonly signature: string,
    readonly modifiers: Modifier[] = [],
    doc?: DocSchema,
    readonly typeParams?: string[]
  ) {
    super();
    this.props = props;
    this.returnType = returnType;
    this.doc = doc;
  }

  toString() {
    const paramsStr = this.props.toString();
    const typeParamsStr = this.typeParams ? `<${this.typeParams.join(', ')}>` : '';
    return `${this.modifiersToString()}${typeParamsStr}${chalk.bold(
      this.name
    )}(${paramsStr}): ${this.returnType.toString()}`;
  }

  isDeprecated(): boolean {
    return Boolean(this.doc?.hasTag(TagName.deprecated));
  }

  isPrivate(): boolean {
    return Boolean(this.modifiers.find((m) => m === 'private') || this.doc?.hasTag(TagName.private));
  }

  private modifiersToString() {
    const modifiersToPrint = this.modifiers.filter((modifier) => modifier !== 'export');
    return modifiersToPrint.length ? `${modifiersToPrint.join(' ')} ` : '';
  }

  toObject() {
    return {
      ...super.toObject(),
      name: this.name,
      props: this.props.toObject(),
      returnType: this.returnType.toObject(),
      signature: this.signature,
      modifiers: this.modifiers,
      doc: this.doc?.toObject(),
      typeParams: this.typeParams,
    };
  }

  static fromObject(obj: Record<string, any>): ReactSchema {
    const location = obj.location;
    const name = obj.name;
    const props = ParameterSchema.fromObject(obj.props);
    const returnType = SchemaRegistry.fromObject(obj.returnType);
    const signature = obj.signature;
    const modifiers = obj.modifiers;
    const doc = obj.doc ? DocSchema.fromObject(obj.doc) : undefined;
    const typeParams = obj.typeParams;
    return new ReactSchema(location, name, props, returnType, signature, modifiers, doc, typeParams);
  }
}
