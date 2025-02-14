import type { FC } from "react";
import React, { useCallback, useState } from "react";
import { LoadingOverlay } from "@mantine/core";
import Editor, { type EditorProps, loader, type OnMount, useMonaco } from "@monaco-editor/react";
import useConfig from "src/store/useConfig";
import useFile from "src/store/useFile";

loader.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs",
  },
});

const editorOptions: EditorProps["options"] = {
  formatOnPaste: true,
  tabSize: 2,
  formatOnType: true,
  minimap: { enabled: false },
  stickyScroll: { enabled: false },
  scrollBeyondLastLine: false,
  placeholder: "Start typing...",
};

interface NodeEditorProps {
  value?: string;
  onChange?: (value?: string) => void;
}

const NodeEditor: FC<NodeEditorProps> = ({ value, onChange }) => {
  const monaco = useMonaco();
  const [contents, setContents] = useState<string | undefined>(value);
  const setError = useFile(state => state.setError);
  const jsonSchema = useFile(state => state.jsonSchema);
  const getHasChanges = useFile(state => state.getHasChanges);
  const theme = useConfig(state => (state.darkmodeEnabled ? "vs-dark" : "light"));
  const fileType = useFile(state => state.format);

  React.useEffect(() => {
    monaco?.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      enableSchemaRequest: true,
      ...(jsonSchema && {
        schemas: [
          {
            uri: "http://myserver/foo-schema.json",
            fileMatch: ["*"],
            schema: jsonSchema,
          },
        ],
      }),
    });
  }, [jsonSchema, monaco?.languages.json.jsonDefaults]);

  React.useEffect(() => {
    const beforeunload = (e: BeforeUnloadEvent) => {
      if (getHasChanges()) {
        const confirmationMessage =
          "Unsaved changes, if you leave before saving  your changes will be lost";

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage;
      }
    };

    window.addEventListener("beforeunload", beforeunload);

    return () => {
      window.removeEventListener("beforeunload", beforeunload);
    };
  }, [getHasChanges]);

  const handleMount: OnMount = useCallback(editor => {
    editor.onDidPaste(() => {
      editor.getAction("editor.action.formatDocument")?.run();
    });
  }, []);

  const handleChange = (value?: string) => {
    setContents(value);

    if (onChange) {
      onChange(value);
    }
  };

  return (
    <Editor
      height={240}
      language={fileType}
      theme={theme}
      value={contents}
      options={editorOptions}
      onMount={handleMount}
      onValidate={errors => setError(errors[0]?.message)}
      onChange={handleChange}
      loading={<LoadingOverlay visible />}
    />
  );
};

export default NodeEditor;
