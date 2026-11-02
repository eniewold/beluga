import { afterEach, describe, expect, it, vi } from 'vitest';

/** Opening a file, folder or URL with the system (BLG: Help › Open the Log on Windows). */
const spawned: Array<{ cmd: string; args: string[] }> = [];
let platform: NodeJS.Platform = 'win32';

vi.mock('node:child_process', async (orig) => ({
  ...(await orig<typeof import('node:child_process')>()),
  spawn: (cmd: string, args: string[]) => {
    spawned.push({ cmd, args });
    if (cmd === 'xdg-open') throw new Error('spawn xdg-open ENOENT');
    return { on: () => ({ unref: () => undefined }), unref: () => undefined };
  },
}));

const { openerFor, folderOf, systemOpen, revealInFinder } = await import('../src/core/os-open.js');

const onPlatform = (p: NodeJS.Platform): void => {
  platform = p;
  Object.defineProperty(process, 'platform', { value: p, configurable: true });
};
const real = process.platform;
afterEach(() => {
  spawned.length = 0;
  onPlatform(real);
});

describe('openerFor', () => {
  it('on Windows hands Explorer a path with backslashes only: a mixed one would open Documents', () => {
    expect(openerFor('C:\\Users\\you/.beluga/logs', 'win32')).toEqual({ cmd: 'explorer', args: ['C:\\Users\\you\\.beluga\\logs'] });
    expect(openerFor('C:/Users/you/.beluga/logs/daemon.log', 'win32').args).toEqual(['C:\\Users\\you\\.beluga\\logs\\daemon.log']);
    expect(openerFor('C:\\Users\\you\\.beluga\\logs', 'win32').args).toEqual(['C:\\Users\\you\\.beluga\\logs']);
  });

  it('on Windows leaves a URL as it is', () => {
    expect(openerFor('https://github.com/x/y/pull/1', 'win32')).toEqual({ cmd: 'explorer', args: ['https://github.com/x/y/pull/1'] });
  });

  it('elsewhere opens the target untouched', () => {
    expect(openerFor('/Users/you/.beluga/logs', 'darwin')).toEqual({ cmd: 'open', args: ['/Users/you/.beluga/logs'] });
    expect(openerFor('/home/you/.beluga/logs', 'linux')).toEqual({ cmd: 'xdg-open', args: ['/home/you/.beluga/logs'] });
  });
});

describe('folderOf', () => {
  it('knows both separators', () => {
    expect(folderOf('C:\\Users\\you\\.beluga\\logs\\daemon.log', 'win32')).toBe('C:\\Users\\you\\.beluga\\logs');
    expect(folderOf('C:\\Users\\you/.beluga/logs/daemon.log', 'win32')).toBe('C:\\Users\\you/.beluga/logs');
    expect(folderOf('/Users/you/.beluga/logs/daemon.log', 'darwin')).toBe('/Users/you/.beluga/logs');
  });
});

describe('systemOpen and revealInFinder', () => {
  it('spawn Explorer with the normalised path on Windows', () => {
    onPlatform('win32');
    systemOpen('C:\\Users\\you/.beluga/logs');
    revealInFinder('C:\\Users\\you/.beluga/logs/daemon.log');
    expect(spawned).toEqual([
      { cmd: 'explorer', args: ['C:\\Users\\you\\.beluga\\logs'] },
      { cmd: 'explorer', args: ['C:\\Users\\you\\.beluga\\logs'] },
    ]);
    expect(platform).toBe('win32');
  });

  it('reveal the file itself on a Mac', () => {
    onPlatform('darwin');
    revealInFinder('/Users/you/.beluga/logs/daemon.log');
    expect(spawned).toEqual([{ cmd: 'open', args: ['-R', '/Users/you/.beluga/logs/daemon.log'] }]);
  });

  it('never throw when the opener is missing', () => {
    onPlatform('linux');
    expect(() => systemOpen('/tmp/x')).not.toThrow();
  });
});
