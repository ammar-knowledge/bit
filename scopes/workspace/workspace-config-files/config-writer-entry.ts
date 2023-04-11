import { Environment, ExecutionContext } from '@teambit/envs';
import {
  EnvCompsDirsMap,
  EnvMapValue,
  EnvsWrittenExtendingConfigFiles,
  WrittenConfigFile,
} from './workspace-config-files.main.runtime';

export type ConfigFile = {
  /**
   * Name of the config file.
   * supports also using `{hash}` in the name, which will be replaced by the hash of the config file.
   */
  name: string;
  /**
   * Content of the config file.
   * I.E the content of the tsconfig.json file.
   */
  content: string;
  /**
   * Hash of the config file.
   */
  hash?: string;
};

export type ExtendingConfigFile = ConfigFile & {
  /**
   * the config file that this config file extends.
   */
  extendingTarget: WrittenConfigFile;

  /**
   * When replacing the config file name with the actual path of the config file, use absolute paths.
   */
  useAbsPaths?: boolean;
};

export type PostProcessExtendingConfigFilesArgs = {
  workspaceDir: string;
  configsRootDir: string;
  writtenExtendingConfigFiles: EnvsWrittenExtendingConfigFiles;
  envCompsDirsMap: EnvCompsDirsMap;
  dryRun: boolean;
};

export type GenerateExtendingConfigFilesArgs = {
  workspaceDir: string;
  configsRootDir: string;
  writtenConfigFiles: WrittenConfigFile[];
  envCompsDirsMap: EnvCompsDirsMap;
  dryRun: boolean;
};

export type PostProcessConfigFilesOptions = {
  dryRun: boolean;
};

export interface ConfigWriterEntry {
  /**
   * Name of the config writer.
   * used for outputs and logging.
   */
  name: string;

  /**
   * Name that is used to filter the config writer by the cli when using --writers flag.
   */
  cliName: string;

  /**
   * Get's the component env and return the config file content
   * for example the eslint config to tsconfig.
   * This also enable to return a hash of the config file, which will be used to determine if
   * 2 config files are the same.
   * If the hash is not provided, the content will be used as the hash.
   * This enables the specific config type to ignore specific fields when calculating the
   * hash in order to ignore theses fields when determining if 2 config files are the same.
   * The calc function also get the target directory of the config file (calculated by this aspect) as sometime there
   * is a need to change the config file content based on the target directory.
   * for example, change the includes/excludes paths to be relative to the target directory.
   * The calc can return undefined if the config file is not relevant for the component. or not supported by the subscriber.
   * for example if the component uses babel to compile, then tsconfig is not relevant.
   * @param env
   */
  calcConfigFiles(executionContext: ExecutionContext, env: Environment, dir: string): ConfigFile[] | undefined;

  /**
   * This enables the writer to do some post processing after the config files were written.
   * this is important in case when we need to change a config file after it was written based on all
   * the environments in the ws
   * or based on other config files that were written.
   * @param writtenConfigFiles
   */
  postProcessConfigFiles?(
    writtenConfigFiles: WrittenConfigFile[],
    executionContext: ExecutionContext,
    envMapValue: EnvMapValue,
    options: PostProcessConfigFilesOptions
  ): Promise<void>;

  /**
   * This will be used to generate an extending file content.
   * For example, the tsconfig.json file will extend the real tsconfig.{hash}.json file (that were coming from the env).
   * That way we can avoid writing the same config file multiple times.
   * It also reduces the risk of the user manually change the config file and then the changes will be lost.
   * This function support returning a file with content with a dsl using `{}` to replace the config file name.
   * for example:
   * content = `{
   *   "extends": {configFile.name},
   * }`
   */
  generateExtendingFile(args: GenerateExtendingConfigFilesArgs): ExtendingConfigFile | undefined;

  /**
   * This enables the writer to do some post processing after the extending config files were written.
   * this is important in case when we need to change a config file / extending config file after it was written based on all
   * the environments in the ws
   * or based on other config files that were written.
   * @param args
   */
  postProcessExtendingConfigFiles?(args: PostProcessExtendingConfigFilesArgs): Promise<void>;

  /**
   * Find all the files that are relevant for the config type.
   * This is used to clean / delete these files
   * This should return an array of glob patterns (that will passed to the globby/minimatch library)
   * @param dir
   */
  patterns: string[];

  /**
   * A function to determine if a file was generated by bit.
   * This is useful to check if the config file was generated by bit to prevent delete user's file.
   * @param filePath
   * @returns
   */
  isBitGenerated?: (filePath: string) => boolean;
}
