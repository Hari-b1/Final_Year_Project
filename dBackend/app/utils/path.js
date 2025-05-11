// utils/path.js
import { fileURLToPath } from 'url';
import path from 'path';

export function getDirName(metaUrl) {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = path.dirname(__filename);
  return { __filename, __dirname };
}
