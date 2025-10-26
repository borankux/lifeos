import type { PreloadApi } from '../preload';

declare global {  
  interface Window {
    api: PreloadApi;
    windowControls: {
      minimize: () => Promise<void>;
      close: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      toggleMaximize: () => Promise<void>;
    };
  }
}

export {};
