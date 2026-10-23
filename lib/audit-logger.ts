import { db } from "./db";
import { auditLogs } from "./schema";

export type AuditAction =
  | "ADMIN_APPROVE_EVENT"
  | "ADMIN_REJECT_EVENT"
  | "ADMIN_EDIT_EVENT"
  | "ADMIN_DELETE_EVENT"
  | "ADMIN_CANCEL_REGISTRATION"
  | "ADMIN_CHANGE_USER_ROLE"
  | "ORGANIZER_CHECKIN"
  | "OFFLINE_CHECKIN_SYNC"
  | "BIB_TRANSFER"
  | "REFUND_APPROVED"
  | "MEDICAL_RECORD_ACCESSED"
  | "EXPORT_PARTICIPANTS";

export interface LogAuditParams {
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: AuditAction;
  entityType: "event" | "registration" | "user" | "medical_record" | "checkin" | "payment";
  entityId: string;
  fromState?: string | null;
  toState?: string | null;
  details?: string | Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * High-Security Audit Logger for WHO, WHAT, WHEN, FROM, TO, IP, USER AGENT
 */
export async function recordAuditLog(params: LogAuditParams) {
  try {
    const detailsStr =
      typeof params.details === "object" && params.details !== null
        ? JSON.stringify(params.details)
        : params.details || null;

    await db.insert(auditLogs).values({
      userId: params.userId || null,
      userName: params.userName || null,
      userRole: params.userRole || "user",
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      fromState: params.fromState || null,
      toState: params.toState || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      details: detailsStr,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
