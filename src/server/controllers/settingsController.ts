import { Request, Response, NextFunction } from 'express';
import { loadSettings, saveSettings } from '../../services/settings';

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = loadSettings();
    res.json({ data: settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = loadSettings();
    const updated = { ...settings, ...req.body };
    saveSettings(updated);
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
}

export async function getTheme(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = loadSettings();
    res.json({ data: { theme: settings.theme || 'light' } });
  } catch (error) {
    next(error);
  }
}

export async function updateTheme(req: Request, res: Response, next: NextFunction) {
  try {
    const { theme } = req.body;
    
    if (!theme || !['light', 'dark'].includes(theme)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid theme. Must be "light" or "dark"'
        }
      });
    }

    const settings = loadSettings();
    settings.theme = theme;
    saveSettings(settings);
    res.json({ data: { theme } });
  } catch (error) {
    next(error);
  }
}
