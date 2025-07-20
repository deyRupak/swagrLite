interface HeaderProps {
  spec: string;
  downloadSpec: (spec: string, format: "yaml" | "json") => void;
  importFromUrl: () => void;
  toggleTheme: () => void;
  theme: "light" | "dark";
}

const Header: React.FC<HeaderProps> = ({ spec, downloadSpec, importFromUrl, toggleTheme, theme }) => {
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
          onClick={() => downloadSpec(spec, 'yaml')}
          style={{ marginRight: 8 }}
        >
          Download YAML
        </button>
        <button
          className="button"
          onClick={() => downloadSpec(spec, 'json')}
          style={{ marginRight: 8 }}
        >
          Download JSON
        </button>
        <button className="button" onClick={importFromUrl} style={{ marginRight: 8 }}>
          Import from URL
        </button>
        <button className="button" onClick={toggleTheme}>
          Toggle {theme === "dark" ? "Light" : "Dark"} Mode
        </button>
      </div>
      <p style={{ fontSize: "1.2rem", fontWeight: "bolder" }}>SwagrLite</p>
    </div>
  );
};

export default Header;
