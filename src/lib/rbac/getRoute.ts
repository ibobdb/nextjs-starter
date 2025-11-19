import fs from 'fs';
import path from 'path';

export function getRoutes(dirPath: string, basePath: string = ''): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    const routePath = path.posix.join(basePath, entry.name);

    if (entry.isDirectory()) {
      return getRoutes(fullPath, routePath);
    }

    // hanya hitung file page.tsx
    if (entry.isFile() && entry.name === 'page.tsx') {
      const cleanRoute = basePath || '/';
      return [cleanRoute];
    }

    return [];
  });
}
