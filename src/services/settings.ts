import fs from 'fs';
import path from 'path';

export interface Settings {
  activeProjectId?: number;
}

const SETTINGS_FILENAME = 'settings.json';

function getSettingsPath() {
  const { app } = require('electron');
  const dir = path.join(app.getPath('userData'), 'lifeos');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, SETTINGS_FILENAME);
}

export function loadSettings(): Settings {
  const settingsPath = getSettingsPath();
  if (!fs.existsSync(settingsPath)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(raw) as Settings;
  } catch (error) {
    console.warn('Failed to read settings file', error);
    return {};
  }
}

export function saveSettings(settings: Settings) {
  const settingsPath = getSettingsPath();
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

export function updateSettings(partial: Partial<Settings>) {
  const current = loadSettings();
  const next = { ...current, ...partial } satisfies Settings;
  saveSettings(next);
}
