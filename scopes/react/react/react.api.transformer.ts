import { ReactSchema } from '@teambit/react';
import {
  FunctionLikeSchema,
  ParameterSchema,
  SchemaNode,
  TypeRefSchema,
} from '@teambit/semantics.entities.semantic-schema';
import { SchemaNodeTransformer } from '@teambit/typescript';

const REACT_FILE_EXT = ['.tsx', '.jsx'];

// only detects functional react components for now
export class ReactAPITransformer implements SchemaNodeTransformer {
  predicate(node: SchemaNode) {
    const isFunctionLike = node instanceof FunctionLikeSchema;
    if (!isFunctionLike) return false;
    const functionNode = node as FunctionLikeSchema;
    const isReactFile = REACT_FILE_EXT.some((r) => functionNode.location.filePath.includes(r));
    if (!isReactFile) return false;
    const params = functionNode.params;
    if (params.length !== 1) return false;
    const isParamTypeRef = params[0] instanceof ParameterSchema;
    if (!isParamTypeRef) return false;
    const returnsPotentialReactElement = [
      'JSX.Element',
      'React.ReactNode',
      'null',
      'undefined',
      'React.ReactChild',
      'React.ReactFragment',
      'React.ReactPortal',
    ].includes(node.returnType?.name ?? node.returnType.toString());
    if (!returnsPotentialReactElement) return false;
    return true;
  }

  async transform(node: FunctionLikeSchema): Promise<SchemaNode> {
    console.log(
      '🚀 ~ file: react.api.transformer.ts:38 ~ ReactAPITransformer ~ transform ~ node.returnType:',
      node.returnType
    );

    return new ReactSchema(
      node.location,
      node.name,
      node.params[0] as ParameterSchema<TypeRefSchema>,
      new TypeRefSchema(node.returnType.location, node.returnType.name ?? '', undefined, 'react'),
      node.signature,
      node.modifiers,
      node.doc,
      node.typeParams
    );
  }
}
