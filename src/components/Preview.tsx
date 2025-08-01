import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

interface PreviewProps {
  parsedSpec: any | null;
  theme: "light" | "dark";
}

const Preview: React.FC<PreviewProps> = ({ parsedSpec, theme }) => {
  if (!parsedSpec) {
    return (
      <div
        style={{
          width: "50%",
          padding: "20px",
          background: "#fffbe6",
          color: "#b26a00",
        }}
      >
        ⚠️ Preview unavailable: YAML is invalid or not parsed.
      </div>
    );
  }

  return (
    <div
      style={{
        width: "50%",
        height: "100vh",
        overflow: "scroll",
        backgroundColor: theme === "light" ? "#ffffff" : "#ffffff",
        color: theme === "light" ? "#000000" : "#000000",
      }}
    >
      <SwaggerUI spec={parsedSpec} />
    </div>
  );
};

export default Preview;
