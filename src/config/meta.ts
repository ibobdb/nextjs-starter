import packageJson from '../../package.json';

/**
 * Global application metadata
 * 
 * Provides a single source of truth for static metadata like version numbers,
 * application name, etc. By importing this object, you avoid repeating 
 * manually typed versions across components.
 */
export const siteMetadata = {
  name: packageJson.name,
  version: packageJson.version,
  description: 'DBStudio',
  author: '',
  repoUrl: '',
  // You can also mix with env variables if needed
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'production',
};

export default siteMetadata;
