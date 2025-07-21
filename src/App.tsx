import React, { useEffect, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import Split from "react-split";
import * as monaco from "monaco-editor";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import Header from "./components/Header";
import ErrorDisplay from "./components/ErrorDisplay";
import { saveToDB, loadFromDB } from "./schemas/indexedDb";
import { debounce } from "./utils/debounce";
import {
  handleFileDrop,
  downloadSpec,
  importFromUrl,
  importFromFile
} from "./utils/fileHandler";
import { validateOpenAPI, parseDocumentForPreview } from "./utils/yamlUtils";
import "./App.css";

type OpenApiError = { message: string; line?: number };

const App: React.FC = () => {
  const [spec, setSpec] = useState<string>(
    "# Please begin editing or drag and drop your file into this area to upload.\n\nopenapi: 3.0.0\ninfo:\n  title: Sample API\n  version: 1.0.0\npaths: {}"
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

  useEffect(() => {
    const loadPersistedState = async () => {
      const savedSpec = await loadFromDB(STORAGE_KEYS.SPEC);
      const savedYamlError = await loadFromDB(STORAGE_KEYS.YAML_ERROR);
      const savedErrors = await loadFromDB(STORAGE_KEYS.OPENAPI_ERRORS);
      const savedTheme = await loadFromDB(STORAGE_KEYS.THEME);

      if (savedSpec) setSpec(savedSpec);
      if (savedYamlError) setYamlError(savedYamlError);
      if (savedErrors) setOpenApiErrors(savedErrors);
      if (savedTheme) setTheme(savedTheme);
    };

    loadPersistedState();
  }, []);

  const jumpToLine = (line: number) => {
    const editor = editorRef.current;
    if (editor) {
      editor.revealLineInCenter(line);
      editor.setPosition({ lineNumber: line, column: 1 });
      editor.focus();
    }
  };

  const debouncedSave = useCallback(
    debounce(async (spec, yamlError, openApiErrors, theme) => {
      await saveToDB(STORAGE_KEYS.SPEC, spec);
      await saveToDB(STORAGE_KEYS.YAML_ERROR, yamlError);
      await saveToDB(STORAGE_KEYS.OPENAPI_ERRORS, openApiErrors);
      await saveToDB(STORAGE_KEYS.THEME, theme);
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSave(spec, yamlError, openApiErrors, theme);
  }, [spec, yamlError, openApiErrors, theme, debouncedSave]);

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
    <>
      <Helmet>
        <title>SwagrLite - Lightweight Swagger Editor</title>
        <meta
          name="description"
          content="SwagrLite: A lightweight and easy-to-use Swagger (OpenAPI) editor for designing, linting & exploring API specs."
        />
        <meta
          name="keywords"
          content="swagger editor, openapi spec, api design, openapi linting"
        />
        <meta name="robots" content="index, follow" />
        {/* Open Graph meta tags */}
        <meta
          property="og:title"
          content="SwagrLite - Lightweight Swagger Editor"
        />
        <meta
          property="og:description"
          content="Edit and lint OpenAPI specs quickly with SwagrLite."
        />
        <meta
          property="og:url"
          content="https://deyrupak.github.io/swagrLite/"
        />
        <meta property="og:type" content="website" />
      </Helmet>

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
        <Header
          spec={spec}
          downloadSpec={downloadSpec}
          importFromUrl={() => importFromUrl(setSpec)}
          importFromFile={(e) => importFromFile(e, setSpec)}
          toggleTheme={() =>
            setTheme((prev) => (prev === "light" ? "dark" : "light"))
          }
          theme={theme}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
          }}
        >
          <Split
            className="split"
            sizes={[50, 50]}
            minSize={300}
            gutterSize={6}
            direction="horizontal"
          >
            <Editor
              spec={spec}
              setSpec={setSpec}
              setYamlError={setYamlError}
              yamlError={yamlError}
              openApiErrors={openApiErrors}
              editorRef={editorRef}
              theme={theme}
            />
            {!yamlError && openApiErrors.length === 0 && (
              <Preview parsedSpec={parsedSpec} theme={theme} />
            )}
          </Split>

          <ErrorDisplay
            openApiErrors={openApiErrors}
            jumpToLine={jumpToLine}
            theme={theme}
          />
        </div>
      </div>
    </>
  );
};

export default App;
