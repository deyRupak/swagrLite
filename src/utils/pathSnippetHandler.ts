export const pathsSnippet = `paths:
  /example/{exampleId}:
    get:
      tags:
        - example
      summary: Find example by ID.
      description: Returns a single example resource.
      operationId: getExampleById
      parameters:
        - name: exampleId
          in: path
          description: ID of example to return
          required: true
          schema:
            type: integer
            format: int64
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Example'
            application/xml:
              schema:
                $ref: '#/components/schemas/Example'
`;

// if 'paths' exists, replaces it; otherwise, inserts after 'info:' section or 'openapi:' if 'info:' not found
export function addOrReplacePathsInSpec(currentSpec: string): string {
  const lines = currentSpec.split("\n");

  const pathsIndex = lines.findIndex((line) =>
    line.trim().startsWith("paths:")
  );
  const infoIndex = lines.findIndex((line) => line.trim().startsWith("info:"));
  const openapiIndex = lines.findIndex((line) =>
    line.trim().startsWith("openapi:")
  );

  if (pathsIndex !== -1) {
    // remove existing paths section
    let endIndex = pathsIndex + 1;
    while (
      endIndex < lines.length &&
      (lines[endIndex].startsWith(" ") || lines[endIndex].startsWith("\t"))
    ) {
      endIndex++;
    }
    lines.splice(
      pathsIndex,
      endIndex - pathsIndex,
      ...pathsSnippet.split("\n")
    );
    return lines.join("\n");
  } else {
    // insert paths snippet after info or openapi line
    const insertAfterIndex = infoIndex !== -1 ? infoIndex : openapiIndex;
    if (insertAfterIndex === -1) {
      // no openapi or info found, prepend paths snippet
      return `${pathsSnippet}\n${currentSpec}`;
    }
    lines.splice(insertAfterIndex + 1, 0, ...pathsSnippet.split("\n"));
    return lines.join("\n");
  }
}

// returns a handler function to add or replace the paths snippet in the editor spec
export function createAddPathsHandler(
  setSpec: React.Dispatch<React.SetStateAction<string>>
): () => void {
  return () => {
    setSpec((currentSpec) => addOrReplacePathsInSpec(currentSpec));
  };
}
