export const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME ?? 'admin';
export const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? 'poutsa';
export const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? 'admin@info-website.local';

export function isSuperAdminUsername(username: string) {
  return username.trim().toLowerCase() === SUPER_ADMIN_USERNAME.toLowerCase();
}

export function isSuperAdminCredentials(username: string, password: string) {
  return isSuperAdminUsername(username) && password === SUPER_ADMIN_PASSWORD;
}
