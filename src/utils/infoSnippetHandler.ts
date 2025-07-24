import yaml from 'yaml';
import { isJSON } from './yamlUtils';

const infoSnippet = `info:
  title: Sample API
  description:
    This is a sample API to demonstrate the info object in an OpenAPI definition.
  termsOfService: https://example.com/terms/
  contact:
    name: API Support
    url: https://example.com/support
    email: support@example.com
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0.html
  version: 1.0.0`;

// parse infoSnippet YAML once to JSON object
const infoObject = yaml.parse(infoSnippet).info;

// if 'info' exists, replaces it; otherwise, inserts after 'openapi:' line
export function addOrReplaceInfoInSpec(currentSpec: string): string {
  if (isJSON(currentSpec)) {
    try {
      const specObj = JSON.parse(currentSpec);
      specObj.info = infoObject;
      return JSON.stringify(specObj, null, 2);
    } catch {
      // if JSON parse fails, return original
      return currentSpec;
    }
  } else {
    // YAML path
    try {
      const specObj = yaml.parse(currentSpec);
      specObj.info = infoObject;
      // convert back to YAML string preserving style
      return yaml.stringify(specObj);
    } catch {
      // if YAML parse fails, fallback to line-based approach or return original
      const lines = currentSpec.split("\n");
      const openapiIndex = lines.findIndex((line) =>
        line.trim().startsWith("openapi:")
      );
      if (openapiIndex === -1) {
        // no openapi: line found, prepend info snippet
        return `${infoSnippet}\n${currentSpec}`;
      }
      const infoIndex = lines.findIndex((line) => line.trim().startsWith("info:"));
      if (infoIndex !== -1) {
        // remove existing info section
        let endIndex = infoIndex + 1;
        while (
          endIndex < lines.length &&
          (lines[endIndex].startsWith(" ") || lines[endIndex].startsWith("\t"))
        ) {
          endIndex++;
        }
        lines.splice(infoIndex, endIndex - infoIndex, ...infoSnippet.split("\n"));
        return lines.join("\n");
      } else {
        // insert info snippet after openapi line
        lines.splice(openapiIndex + 1, 0, ...infoSnippet.split("\n"));
        return lines.join("\n");
      }
    }
  }
}

// returns a handler function to add or replace the info snippet in the editor spec
export function createAddInfoHandler(
  setSpec: React.Dispatch<React.SetStateAction<string>>
): () => void {
  return () => {
    setSpec((currentSpec) => addOrReplaceInfoInSpec(currentSpec));
  };
}
