import yaml from 'yaml';

// Handle file drop to parse YAML or JSON
export const handleFileDrop = (
  e: React.DragEvent,
  setSpec: React.Dispatch<React.SetStateAction<string>>
) => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const content = reader.result as string;
    try {
      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(content);
        setSpec(yaml.stringify(parsed));
      } else if (file.name.endsWith(".yaml") || file.name.endsWith(".yml")) {
        yaml.parse(content);
        setSpec(content);
      } else {
        alert("Unsupported file type. Only .yaml, .yml, and .json allowed.");
      }
    } catch (err: any) {
      alert(`Error parsing file: ${err.message}`);
    }
  };
  reader.readAsText(file);
};

// Download the spec in JSON or YAML format
export const downloadSpec = (spec: string, format: "yaml" | "json") => {
  try {
    const doc = yaml.parse(spec);
    const content =
      format === "json" ? JSON.stringify(doc, null, 2) : yaml.stringify(doc);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `openapi-spec.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err: any) {
    alert(`Error exporting: ${err.message}`);
  }
};

// Import spec from URL (YAML or JSON)
export const importFromUrl = async (setSpec: React.Dispatch<React.SetStateAction<string>>) => {
  const url = prompt("Enter URL to import OpenAPI (YAML or JSON):");
  if (!url) return;

  try {
    const res = await fetch(url);
    const text = await res.text();

    try {
      const parsedJson = JSON.parse(text);
      if (parsedJson.openapi && parsedJson.info) {
        const yamlStr = yaml.stringify(parsedJson);
        setSpec(yamlStr);
      } else {
        alert("This JSON does not appear to be a valid OpenAPI spec.");
      }
    } catch (jsonError) {
      try {
        yaml.parse(text);
        setSpec(text);
      } catch (yamlError) {
        alert("The provided URL content is neither a valid OpenAPI JSON nor YAML.");
      }
    }
  } catch (err: any) {
    alert("Failed to import spec: " + err.message);
  }
};
