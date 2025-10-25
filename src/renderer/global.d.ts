import type { PreloadApi } from '../preload';\n\ndeclare global {\n  interface Window {\n    api: PreloadApi;\n  }\n}\n
