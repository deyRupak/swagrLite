import React from 'react';

type OpenApiError = { message: string; line?: number };

interface ErrorDisplayProps {
  openApiErrors: OpenApiError[];
  jumpToLine: (line: number) => void;
  theme: "light" | "dark";
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ openApiErrors, jumpToLine, theme }) => {
  return (
    openApiErrors.length > 0 && (
      <div
        style={{
          borderTop: "1px solid #ccc",
          padding: "8px",
          backgroundColor: theme === "dark" ? "#2a1e1e" : "#fff3f3",
          color: theme === "dark" ? "#ffb3b3" : "#b00020",
          fontFamily: "monospace",
          height: "10rem",
          position: "fixed",
          zIndex: 99,
          bottom: 0,
          width: "100%",
          overflowY: "scroll",
        }}
      >
        <strong>OpenAPI Validation Issues:</strong>
        <ul style={{ marginTop: "6px", paddingLeft: "20px" }}>
          {openApiErrors.map((err, i) => (
            <li
              key={i}
              style={{
                cursor: err.line ? "pointer" : "default",
                color: theme === "dark" ? "#ffb3b3" : "#b00020",
              }}
              onClick={() => err.line && jumpToLine(err.line)}
            >
              {err.line ? `Line ${err.line}: ` : ""}
              {err.message}
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

export default ErrorDisplay;
