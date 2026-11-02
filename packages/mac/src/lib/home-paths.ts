/**
 * Paths under your home folder, written the way that folder is: with backslashes on Windows
 * ("C:\Users\you\.beluga\logs"), with slashes elsewhere. A mixed path ("C:\Users\you/.beluga")
 * is one Explorer refuses (it opens Documents instead).
 */

/** The separator a path uses: backslash for a Windows path, slash otherwise. */
export const separatorOf = (p: string): '\\' | '/' => (/^[A-Za-z]:[\\/]|^\\\\/.test(p) || (p.includes('\\') && !p.includes('/')) ? '\\' : '/');

/** `parts` under `home`, joined with the separator `home` uses. */
export function underHome(home: string, ...parts: readonly string[]): string {
  const sep = separatorOf(home);
  const base = home.replace(/[\\/]+$/, '');
  return [base, ...parts].join(sep);
}

/** The folder a path is in, whichever separator it uses ("/" or "C:\" at the top). */
export function parentOf(p: string): string {
  const sep = separatorOf(p);
  const trimmed = p.replace(/[\\/]+$/, '');
  const at = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));
  if (at < 0) return sep === '\\' ? trimmed : '/';
  const parent = trimmed.slice(0, at);
  if (parent === '') return '/';
  return /^[A-Za-z]:$/.test(parent) ? `${parent}\\` : parent;
}
