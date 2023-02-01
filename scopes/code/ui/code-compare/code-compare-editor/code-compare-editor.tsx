import React from 'react';
import { DiffEditor, DiffOnMount } from '@monaco-editor/react';
import { darkMode } from '@teambit/base-ui.theme.dark-theme';
import { EditorSettingsState } from '@teambit/code.ui.code-compare';

export type CodeCompareEditorProps = {
  language: string;
  handleEditorDidMount?: DiffOnMount;
  Loader: React.ReactNode;
  modifiedFileContent?: string;
  originalFileContent?: string;
  originalPath: string;
  modifiedPath: string;
} & EditorSettingsState;

export function CodeCompareEditor({
  modifiedFileContent,
  originalFileContent,
  originalPath,
  modifiedPath,
  language,
  handleEditorDidMount,
  ignoreWhitespace,
  wordWrap,
  editorViewMode,
  Loader,
}: CodeCompareEditorProps) {
  return (
    <DiffEditor
      modified={modifiedFileContent}
      original={originalFileContent}
      language={language}
      originalModelPath={originalPath}
      modifiedModelPath={modifiedPath}
      height={'100%'}
      onMount={(editor, monaco) => {
        /**
         * disable syntax check
         * ts cant validate all types because imported files aren't available to the editor
         */
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: true,
        });
        monaco.editor.defineTheme('bit', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'scrollbar.shadow': '#222222',
          },
        });
        monaco.editor.setTheme('bit');
        handleEditorDidMount?.(editor, monaco);
      }}
      className={darkMode}
      theme={'vs-dark'}
      options={{
        ignoreTrimWhitespace: ignoreWhitespace,
        readOnly: true,
        renderSideBySide: editorViewMode === 'split',
        minimap: { enabled: false },
        scrollbar: { alwaysConsumeMouseWheel: false },
        scrollBeyondLastLine: false,
        folding: false,
        overviewRulerLanes: 0,
        overviewRulerBorder: false,
        wordWrap: (wordWrap && 'on') || 'off',
        wrappingStrategy: (wordWrap && 'advanced') || undefined,
        fixedOverflowWidgets: true,
        renderLineHighlight: 'none',
        lineHeight: 18,
        padding: { top: 8 },
        selectOnLineNumbers: true,
      }}
      loading={Loader}
    />
  );
}
