interface HeaderProps {
  spec: string;
  downloadSpec: (spec: string, format: "yaml" | "json") => void;
  importFromUrl: () => void;
  importFromFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleTheme: () => void;
  clearEditor: () => void;
  theme: "light" | "dark";
}

const Header: React.FC<HeaderProps> = ({
  spec,
  downloadSpec,
  importFromUrl,
  importFromFile,
  toggleTheme,
  clearEditor,
  theme,
}) => {
  return (
    <div
      style={{
        padding: "8px",
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#f9f9f9",
        borderBottom: theme === "dark" ? "1px solid #444" : "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <button
          className="button"
          onClick={() => downloadSpec(spec, "yaml")}
          style={{ marginRight: 8 }}
        >
          Download YAML
        </button>
        <button
          className="button"
          onClick={() => downloadSpec(spec, "json")}
          style={{ marginRight: 8 }}
        >
          Download JSON
        </button>

        <button
          className="button"
          onClick={importFromUrl}
          style={{ marginRight: 8 }}
        >
          Import from URL
        </button>
        <input
          type="file"
          accept=".yaml,.yml,.json"
          style={{ display: "none" }}
          id="fileInput"
          onChange={importFromFile}
        />
        <label htmlFor="fileInput" className="button">
          Import File
        </label>

        <button className="button" style={{ marginLeft: "2rem" }} onClick={toggleTheme}>
          Toggle {theme === "dark" ? "Light" : "Dark"} Mode
        </button>
        <button className="button" style={{ backgroundColor: "#e82a3a", color: "#fff", marginLeft: "2rem" }} onClick={clearEditor}>
          Clear Editor
        </button>
      </div>

      <p style={{ fontSize: "1.2rem", fontWeight: "bolder", color: "#38d120" }}>
        {"{"} SwagrLite {"}"}
      </p>
    </div>
  );
};

export default Header;
