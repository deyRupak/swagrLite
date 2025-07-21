export function debounce<Func extends (...args: any[]) => void>(
  func: Func,
  wait: number
): (...args: Parameters<Func>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<Func>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
