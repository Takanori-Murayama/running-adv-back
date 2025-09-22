import 'express-session';
import 'passport';

declare module 'express-session' {
  interface SessionData {
    passport?: { user?: any }; // 必要に応じて型定義を細かく
  }
}

declare module 'express' {
  interface User {
    id: string;
    email?: string;
    displayName?: string;
    photoUrl?: string;
    // 必要なら追加
  }

  interface Request {
    logout(cb: (err?: any) => void): void; // passport が追加する logout
    isAuthenticated(): boolean; // passport が追加する isAuthenticated
    user?: User; // Passport が追加する user
  }
}
