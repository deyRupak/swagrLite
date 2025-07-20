import React, { useEffect, useRef, useState } from "react";
import Split from "react-split";
import * as monaco from "monaco-editor";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import Header from "./components/Header";
import ErrorDisplay from "./components/ErrorDisplay";
import { saveToDB, loadFromDB } from "./utils/storage";
import { handleFileDrop, downloadSpec, importFromUrl } from "./utils/fileHandler";
import { validateOpenAPI, parseDocumentForPreview } from "./utils/yamlUtils";
import "./App.css";

type OpenApiError = { message: string; line?: number };

const App: React.FC = () => {
  const [spec, setSpec] = useState<string>(
    "openapi: 3.0.0\ninfo:\n  title: Sample API\n  version: 1.0.0\npaths: {}"
  );
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [openApiErrors, setOpenApiErrors] = useState<OpenApiError[]>([]);
  const [parsedSpec, setParsedSpec] = useState<any | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const STORAGE_KEYS = {
    SPEC: "spec",
    THEME: "theme",
    YAML_ERROR: "yamlError",
    OPENAPI_ERRORS: "openApiErrors",
  };

  // Load from IndexedDB once
  useEffect(() => {
    const loadPersistedState = async () => {
      const savedSpec = await loadFromDB(STORAGE_KEYS.SPEC);
      const savedTheme = await loadFromDB(STORAGE_KEYS.THEME);
      const savedErrors = await loadFromDB(STORAGE_KEYS.OPENAPI_ERRORS);
      const savedYamlError = await loadFromDB(STORAGE_KEYS.YAML_ERROR);

      if (savedSpec) setSpec(savedSpec);
      if (savedTheme) setTheme(savedTheme);
      if (savedErrors) setOpenApiErrors(savedErrors);
      if (savedYamlError) setYamlError(savedYamlError);
    };

    loadPersistedState();
  }, []);

  // Persist to IndexedDB on changes
  useEffect(() => {
    saveToDB(STORAGE_KEYS.SPEC, spec);
    saveToDB(STORAGE_KEYS.YAML_ERROR, yamlError);
    saveToDB(STORAGE_KEYS.OPENAPI_ERRORS, openApiErrors);
    saveToDB(STORAGE_KEYS.THEME, theme);
  }, [spec, yamlError, openApiErrors, theme]);

  const jumpToLine = (line: number) => {
    const editor = editorRef.current;
    if (editor) {
      editor.revealLineInCenter(line);
      editor.setPosition({ lineNumber: line, column: 1 });
      editor.focus();
    }
  };

  useEffect(() => {
    if (yamlError !== null) {
      setOpenApiErrors([]);
      return;
    }

    validateOpenAPI(spec, setOpenApiErrors);
  }, [spec, yamlError]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      parseDocumentForPreview(spec, setParsedSpec);
    }, 300);

    return () => clearTimeout(timeout);
  }, [spec]);


  return (
    <div
      onDrop={(e) => handleFileDrop(e, setSpec)}
      onDragOver={(e) => e.preventDefault()}
      className={theme === "dark" ? "dark" : ""}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: theme === "dark" ? "#121212" : "#f0f0f0",
        color: theme === "dark" ? "#e0e0e0" : "#000000",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <Header spec={spec} downloadSpec={downloadSpec} importFromUrl={() => importFromUrl(setSpec)} toggleTheme={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))} theme={theme} />
      
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
        <Split className="split" sizes={[50, 50]} minSize={300} gutterSize={6} direction="horizontal">
          <Editor
            spec={spec}
            setSpec={setSpec}
            setYamlError={setYamlError}
            yamlError={yamlError}
            openApiErrors={openApiErrors}
            editorRef={editorRef}
            theme={theme}
          />
          {!yamlError && openApiErrors.length === 0 && <Preview parsedSpec={parsedSpec} theme={theme} />}
        </Split>

        <ErrorDisplay openApiErrors={openApiErrors} jumpToLine={jumpToLine} theme={theme} />
      </div>
    </div>
  );
};

export default App;
