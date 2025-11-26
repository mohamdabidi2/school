import { auth } from "@clerk/nextjs/server";
import prisma from "./prisma";

export interface AuditLog {
  id?: number;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export class AuditLogger {
  static async log(action: string, resource: string, details: string, resourceId?: string, success: boolean = true, errorMessage?: string) {
    try {
      const { userId } = await auth();
      if (!userId) return;

      // Get user details from Clerk
      const user = await prisma.staffUser.findFirst({
        where: { clerkId: userId }
      });

      const auditLog: Omit<AuditLog, 'id'> = {
        userId,
        userName: user?.name || 'Unknown User',
        userRole: user?.role || 'unknown',
        action,
        resource,
        resourceId,
        details,
        timestamp: new Date(),
        success,
        errorMessage
      };

      // Store in database (you'll need to create an AuditLog table)
      console.log('AUDIT LOG:', auditLog);
      
      // In production, store in database:
      // await prisma.auditLog.create({ data: auditLog });
      
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  static async logLogin(success: boolean, errorMessage?: string) {
    await this.log(
      'LOGIN',
      'AUTHENTICATION',
      success ? 'User logged in successfully' : 'Login attempt failed',
      undefined,
      success,
      errorMessage
    );
  }

  static async logLogout() {
    await this.log(
      'LOGOUT',
      'AUTHENTICATION',
      'User logged out'
    );
  }

  static async logDataAccess(resource: string, resourceId: string, action: string) {
    await this.log(
      action,
      resource,
      `Accessed ${resource} with ID: ${resourceId}`,
      resourceId
    );
  }

  static async logDataModification(resource: string, resourceId: string, action: string, details: string) {
    await this.log(
      action,
      resource,
      details,
      resourceId
    );
  }

  static async logSecurityEvent(event: string, details: string, success: boolean = false) {
    await this.log(
      'SECURITY_EVENT',
      'SECURITY',
      details,
      undefined,
      success,
      event
    );
  }
}

// Security middleware
export const withAuditLogging = (handler: Function) => {
  return async (req: any, res: any, ...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const result = await handler(req, res, ...args);
      
      // Log successful operation
      await AuditLogger.log(
        req.method,
        req.url,
        `Request completed successfully in ${Date.now() - startTime}ms`
      );
      
      return result;
    } catch (error) {
      // Log failed operation
      await AuditLogger.log(
        req.method,
        req.url,
        `Request failed: ${error}`,
        undefined,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      throw error;
    }
  };
};
