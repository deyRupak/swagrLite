import React, { useEffect, useCallback } from "react";
import MonacoEditor from "react-monaco-editor";
import type { EditorDidMount } from "react-monaco-editor";
import * as monaco from "monaco-editor";
import yaml from "yaml";
import debounce from "lodash.debounce";

interface EditorProps {
  spec: string;
  setSpec: (value: string) => void;
  setYamlError: (error: string | null) => void;
  yamlError: string | null;
  openApiErrors: { message: string; line?: number }[];
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>;
  theme: "light" | "dark";
}

const Editor: React.FC<EditorProps> = ({
  spec,
  setSpec,
  setYamlError,
  yamlError,
  openApiErrors,
  editorRef,
  theme
}) => {
  const handleEditorDidMount: EditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const updateMarkers = useCallback(
    debounce(() => {
      const editor = editorRef.current;
      if (!editor) return;

      const model = editor.getModel();
      if (!model) return;

      const markers: monaco.editor.IMarkerData[] = [];

      // YAML error with line info
      if (yamlError) {
        try {
          const doc = yaml.parseDocument(spec);
          const error = doc.errors?.[0];
          if (error?.linePos) {
            const pos = error.linePos[0];
            markers.push({
              message: error.message,
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: pos.line + 1,
              startColumn: pos.col + 1,
              endLineNumber: pos.line + 1,
              endColumn: pos.col + 2,
            });
          } else {
            markers.push({
              message: yamlError,
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 1,
              endColumn: 1,
            });
          }
        } catch {
          markers.push({
            message: yamlError,
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1,
          });
        }
      }

      // OpenAPI validation errors
      if (!yamlError && openApiErrors.length > 0) {
        openApiErrors.forEach(({ message, line }, idx) => {
          markers.push({
            message,
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: line || 1 + idx,
            startColumn: 1,
            endLineNumber: line || 1 + idx,
            endColumn: 5,
          });
        });
      }

      monaco.editor.setModelMarkers(model, "yaml", markers);
    }, 300),
    [spec, yamlError, openApiErrors]
  );

  useEffect(() => {
    updateMarkers();
  }, [spec, yamlError, openApiErrors, updateMarkers]);

  const handleChange = (value: string | undefined) => {
    setSpec(value || "");
    try {
      yaml.parse(value || "");
      setYamlError(null);
    } catch (e: any) {
      setYamlError(e.message);
    }
  };

  return (
    <div style={{ width: "50%" }}>
      <MonacoEditor
        height="100vh"
        language="yaml"
        value={spec}
        onChange={handleChange}
        editorDidMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 14,
        }}
        theme={theme === "dark" ? "vs-dark" : "vs-light"}
      />
    </div>
  );
};

export default Editor;
