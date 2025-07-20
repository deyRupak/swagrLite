import yaml from 'yaml';
import OpenAPISchemaValidator from "openapi-schema-validator";

type OpenApiError = { message: string; line?: number };

// Get the line number from offset (line position in YAML text)
export function getLineFromOffset(text: string, offset: number): number {
  const lines = text.slice(0, offset).split("\n");
  return lines.length;
}

// Parse YAML and validate with OpenAPI Schema Validator
export function validateOpenAPI(
    spec: string, setOpenApiErrors: React.Dispatch<React.SetStateAction<OpenApiError[]>>
) {
  if (spec.trim() === "") return;

  try {
    const doc = yaml.parseDocument(spec);
    const validator = new OpenAPISchemaValidator({ version: 3 });
    const result = validator.validate(doc.toJS());

    if (result.errors.length > 0) {
      const errors: OpenApiError[] = result.errors.map((err) => {
        const path = err.instancePath?.split("/").filter(Boolean) || [];
        const node = path.reduce((acc: any, key: string) => acc?.get?.(key), doc);
        const pos = node?.range ? getLineFromOffset(spec, node.range[0]) : undefined;

        return {
          message: err.message ?? "Unknown error",
          line: typeof pos === "number" ? pos + 1 : undefined,
        };
      });

      setOpenApiErrors(errors);
    } else {
      setOpenApiErrors([]);
    }
  } catch (err: any) {
    setOpenApiErrors([{ message: "OpenAPI validation failed: " + err.message }]);
  }
}

// Parse document for preview or further processing
export function parseDocumentForPreview(spec: string, setParsedSpec: React.Dispatch<React.SetStateAction<any | null>>) {
  try {
    const doc = yaml.parse(spec);
    setParsedSpec(doc);
  } catch {
    setParsedSpec(null);
  }
}
