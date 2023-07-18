// import React from 'react';
// import { APINodeRenderProps, APINodeRenderer } from '@teambit/api-reference.models.api-node-renderer';
// import { TypeIntersectionSchema } from '@teambit/semantics.entities.semantic-schema';
// import classnames from 'classnames';

// import styles from './type-intersection.renderer.module.scss';

// export const typeIntersectionRenderer: APINodeRenderer = {
//   predicate: (node) => node.__schema === TypeIntersectionSchema.name,
//   Component: TypeIntersectionComponent,
//   nodeType: 'TypeIntersection',
//   default: true,
// };

// function TypeIntersectionComponent(props: APINodeRenderProps) {
//   const {
//     apiNode: { api },
//     renderers,
//     metadata,
//   } = props;

//   const typeNode = api as TypeIntersectionSchema;
//   console.log("🚀 ~ file: type-intersection.renderer.tsx:23 ~ typeNode:", typeNode)

//   return (
//     <div key={`${api.__schema}-${api.name}`} className={styles.node}>
//       {typeNode.types.map((type, index, types) => {
//         const typeRenderer = renderers.find((renderer) => renderer.predicate(type));

//         if (typeRenderer) {
//           return (
//             <React.Fragment key={`typeIntersectionMember-container-${type.toString()}-${index}}`}>
//               <typeRenderer.Component
//                 {...props}
//                 key={`typeIntersectionMember-${type.toString()}-${index}}`}
//                 apiNode={{ ...props.apiNode, api: type, renderer: typeRenderer }}
//                 depth={(props.depth ?? 0) + 1}
//                 metadata={{ [type.__schema]: { columnView: metadata?.[typeNode.__schema]?.columnView } }}
//               />
//               {types.length > 1 && index !== types.length - 1 ? (
//                 <div key={`${type.name}-${index}-&`} className={classnames(styles.node, styles.separator)}>
//                   {'&'}
//                 </div>
//               ) : null}
//             </React.Fragment>
//           );
//         }

//         return (
//           <div key={`${type.name}-${index}`} className={styles.node}>
//             {type.toString()}
//             {types.length > 1 && index !== types.length - 1 ? (
//               <div key={`${type.name}-${index}-&`} className={classnames(styles.node, styles.separator)}>
//                 {'&'}
//               </div>
//             ) : null}
//           </div>
//         );
//       })}
//     </div>
//   );
// }
import React from 'react';
import { APINodeRenderProps, APINodeRenderer } from '@teambit/api-reference.models.api-node-renderer';
import { TypeIntersectionSchema } from '@teambit/semantics.entities.semantic-schema';
import classnames from 'classnames';

import styles from './type-intersection.renderer.module.scss';

export const typeIntersectionRenderer: APINodeRenderer = {
  predicate: (node) => node.__schema === TypeIntersectionSchema.name,
  Component: TypeIntersectionComponent,
  nodeType: 'TypeIntersection',
  default: true,
};

function TypeIntersectionComponent(props: APINodeRenderProps) {
  const {
    apiNode: { api },
    renderers,
    metadata,
  } = props;

  const typeNode = api as TypeIntersectionSchema;

  return (
    <div key={`${api.__schema}-${api.name}`} className={styles.node}>
      {typeNode.types.map((type, index) => {
        const typeRenderer = renderers.find((renderer) => renderer.predicate(type));
        if (typeRenderer) {
          return (
            <div key={`typeIntersectionMember-container-${type.toString()}-${index}}`}>
              {type.name && <div className={styles.typeTitle}>{type.name}</div>}
              <div className={styles.typeBody}>
                <typeRenderer.Component
                  {...props}
                  key={`typeIntersectionMember-${type.toString()}-${index}}`}
                  apiNode={{ ...props.apiNode, api: type, renderer: typeRenderer }}
                  depth={(props.depth ?? 0) + 1}
                  metadata={{ [type.__schema]: { columnView: metadata?.[typeNode.__schema]?.columnView } }}
                />
              </div>
            </div>
          );
        }

        return (
          <div key={`${type.name}-${index}`} className={styles.node}>
            {type.toString()}
            {typeNode.types.length > 1 && index !== typeNode.types.length - 1 ? (
              <div key={`${type.name}-${index}-&`} className={classnames(styles.node, styles.separator)}>
                {'&'}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
