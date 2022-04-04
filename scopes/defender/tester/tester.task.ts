import { BuildContext, BuiltTaskResult, BuildTask, CAPSULE_ARTIFACTS_DIR } from '@teambit/builder';
import fs from 'fs-extra';
import { join } from 'path';
import { Compiler, CompilerAspect } from '@teambit/compiler';
import { DevFilesMain } from '@teambit/dev-files';
import { ComponentMap } from '@teambit/component';
import { Tester } from './tester';
import { detectTestFiles } from './utils';
import { testsResultsToJUnitFormat } from './utils/junit-generator';

/**
 * tester build task. Allows to test components during component build.
 */
export class TesterTask implements BuildTask {
  readonly name = 'TestComponents';
  readonly dependencies = [CompilerAspect.id];
  constructor(readonly aspectId: string, private devFiles: DevFilesMain) {}

  async execute(context: BuildContext): Promise<BuiltTaskResult> {
    const tester: Tester = context.env.getTester();
    const componentsSpecFiles = ComponentMap.as(context.components, (component) => {
      return detectTestFiles(component, this.devFiles);
    });

    const testCount = componentsSpecFiles.toArray().reduce((acc, [, specs]) => acc + specs.length, 0);
    if (testCount === 0)
      return {
        artifacts: [],
        componentsResults: [],
      };

    const specFilesWithCapsule = ComponentMap.as(context.components, (component) => {
      const componentSpecFiles = componentsSpecFiles.get(component);
      if (!componentSpecFiles) throw new Error('capsule not found');
      const [, specs] = componentSpecFiles;
      return specs.map((specFile) => {
        const capsule = context.capsuleNetwork.graphCapsules.getCapsule(component.id);
        if (!capsule) throw new Error('capsule not found');
        const compiler: Compiler = context.env.getCompiler();
        const distPath = compiler.getDistPathBySrcPath(specFile.relative);

        // TODO: fix spec type file need to capsule will return files with type AbstractVinyl
        return { path: join(capsule.path, distPath), relative: distPath };
      });
    });

    const testerContext = Object.assign(context, {
      release: true,
      specFiles: specFilesWithCapsule,
      rootPath: context.capsuleNetwork.capsulesRootDir,
      patterns: specFilesWithCapsule,
    });

    // TODO: remove after fix AbstractVinyl on capsule
    // @ts-ignore
    const testsResults = await tester.test(testerContext);

    // write junit files
    await Promise.all(
      testsResults.components.map(async (compResult) => {
        const junit = testsResultsToJUnitFormat([compResult]);
        const capsule = context.capsuleNetwork.graphCapsules.getCapsule(compResult.componentId);
        if (!capsule) {
          throw new Error(`unable to find ${compResult.componentId.toString()} in capsules`);
        }
        await fs.outputFile(join(capsule.path, getJUnitArtifactPath()), junit);
      })
    );

    return {
      artifacts: getArtifactDef(), // @ts-ignore
      componentsResults: testsResults.components.map((componentTests) => {
        const componentErrors = componentTests.errors;
        const component = context.capsuleNetwork.graphCapsules.getCapsule(componentTests.componentId)?.component;
        if (!component) {
          throw new Error(`unable to find ${componentTests.componentId.toString()} in capsules`);
        }

        return {
          component,
          metadata: { tests: componentTests.results },
          errors: componentErrors,
        };
      }),
    };
  }
}

export function getJUnitArtifactPath() {
  return join(CAPSULE_ARTIFACTS_DIR, '__bit_junit.xml');
}

export function getArtifactDef() {
  return [
    {
      name: 'junit',
      globPatterns: [getJUnitArtifactPath()],
      rootDir: CAPSULE_ARTIFACTS_DIR,
    },
  ];
}
