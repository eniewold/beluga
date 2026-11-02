import { describe, expect, it } from 'vitest';
import { parentOf, separatorOf, underHome } from '../packages/mac/src/lib/home-paths.js';

/** Paths under your home folder, written the way that folder is (Help › Open the Log on Windows). */
describe('underHome', () => {
  it('joins with backslashes under a Windows home, so Explorer opens the folder (not Documents)', () => {
    expect(underHome('C:\\Users\\you', '.beluga', 'logs')).toBe('C:\\Users\\you\\.beluga\\logs');
    expect(underHome('C:\\Users\\you\\', '.beluga', 'logs', 'daemon.log')).toBe('C:\\Users\\you\\.beluga\\logs\\daemon.log');
  });

  it('joins with slashes under a Mac or Linux home', () => {
    expect(underHome('/Users/you', '.beluga', 'logs')).toBe('/Users/you/.beluga/logs');
    expect(underHome('/home/you/', '.beluga', 'logs', 'daemon.log')).toBe('/home/you/.beluga/logs/daemon.log');
  });
});

describe('separatorOf and parentOf', () => {
  it('tell a Windows path from a POSIX one', () => {
    expect(separatorOf('C:\\Users\\you')).toBe('\\');
    expect(separatorOf('C:/Users/you')).toBe('\\');
    expect(separatorOf('\\\\server\\share')).toBe('\\');
    expect(separatorOf('/Users/you')).toBe('/');
  });

  it('give the folder a path is in, up to the root', () => {
    expect(parentOf('/Users/you/.beluga/logs/daemon.log')).toBe('/Users/you/.beluga/logs');
    expect(parentOf('/Users/you/.beluga/logs/')).toBe('/Users/you/.beluga');
    expect(parentOf('/file')).toBe('/');
    expect(parentOf('C:\\Users\\you\\.beluga\\logs\\daemon.log')).toBe('C:\\Users\\you\\.beluga\\logs');
    expect(parentOf('C:\\file')).toBe('C:\\');
  });
});
