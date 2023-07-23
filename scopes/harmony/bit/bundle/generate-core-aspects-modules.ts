import camelcase from 'camelcase';
import { getCoreAspectName, getCoreAspectPackageName } from '@teambit/aspect-loader';
import fs from 'fs-extra';
import { join } from 'path';

import { coreAspectsIds } from '../core-aspects-ids';

export function generateCoreAspectsModules(bundleDir: string, appName: string) {
  const generateOneAspectP = coreAspectsIds.map((id) => {
    const name = getCoreAspectName(id);
    const packageName = getCoreAspectPackageName(id);
    return handleOneAspect(bundleDir, name, packageName, appName);
  });
  generateOneAspectP.push(handleOneAspect(bundleDir, 'legacy', '@teambit/legacy', appName));
  generateOneAspectP.push(handleOneAspect(bundleDir, 'harmony', '@teambit/harmony', appName));
  return Promise.all(generateOneAspectP);
}

async function handleOneAspect(bundleDir: string, name: string, packageName: string, appName: string) {
  const dirPath = join(bundleDir, packageName);
  await fs.ensureDir(dirPath);
  const indexFilePath = join(dirPath, 'index.js');
  const indexFileContent = getIndexContent(name, appName);
  return fs.outputFile(indexFilePath, indexFileContent);
}

function getIndexContent(name: string, appName: string) {
  const camelName = camelcase(name);
  return `
// This file is auto generated by generate-core-aspects-modules.ts
Object.defineProperty(exports, "__esModule", { value: true });
const { ${camelName} } = require("../../${appName}");
module.exports = ${camelName};
`;
}
