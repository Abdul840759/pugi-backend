import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminRequest extends Request {
  adminSession?: { id: string };
}

export function requireAdminSession(req: AdminRequest, res: Response, next: NextFunction) {
  const adminToken = req.headers['x-admin-token'] as string | undefined;
  if (!adminToken) {
    return res.status(401).json({ message: 'Admin session required' });
  }
  try {
    const decoded = jwt.verify(adminToken, process.env.ADMIN_SESSION_SECRET as string) as { id: string; scope: string };
    if (decoded.scope !== 'admin') {
      return res.status(401).json({ message: 'Invalid admin session' });
    }
    if (req.user && req.user.id !== decoded.id) {
      return res.status(401).json({ message: 'Admin session does not match authenticated user' });
    }
    req.adminSession = { id: decoded.id };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired admin session' });
  }
}
