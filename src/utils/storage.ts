export const STORAGE_KEYS = {
  SPEC: "spec",
  THEME: "theme",
  YAML_ERROR: "yamlError",
  OPENAPI_ERRORS: "openApiErrors",
};

export const loadFromDB = async (key: string) => {
  const value = await localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const saveToDB = async (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};
