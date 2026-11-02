import { spawn } from 'node:child_process';
import path from 'node:path';

const isUrl = (target: string): boolean => /^[a-z][a-z0-9+.-]*:\/\//i.test(target);

/**
 * The command that opens `target` on `platform`, and the target as that command wants it.
 * Explorer refuses a path with forward slashes (it opens Documents instead), and the app can build
 * one from a home folder with backslashes: on Windows a path is written with backslashes only.
 */
export function openerFor(target: string, platform: NodeJS.Platform = process.platform): { readonly cmd: string; readonly args: readonly string[] } {
  if (platform === 'darwin') return { cmd: 'open', args: [target] };
  if (platform === 'win32') return { cmd: 'explorer', args: [isUrl(target) ? target : path.win32.normalize(target)] };
  return { cmd: 'xdg-open', args: [target] };
}

/** The folder a file is in, whichever separator the path uses. */
export function folderOf(file: string, platform: NodeJS.Platform = process.platform): string {
  return platform === 'win32' ? path.win32.dirname(file) : path.posix.dirname(file);
}

function run(cmd: string, args: readonly string[]): void {
  try {
    spawn(cmd, [...args], { stdio: 'ignore', detached: true }).on('error', () => undefined).unref();
  } catch {
    // Never throws (e.g. no xdg-open).
  }
}

/** Open a file, folder or URL with the system's default app. Never throws (e.g. no xdg-open). */
export function systemOpen(target: string): void {
  const { cmd, args } = openerFor(target);
  run(cmd, args);
}

/** Show a file in Finder, selected (elsewhere: its folder). Never throws. */
export function revealInFinder(file: string): void {
  if (process.platform !== 'darwin') return systemOpen(folderOf(file));
  run('open', ['-R', file]);
}
