import prisma from "@/lib/prisma";
import { headers } from "next/headers";

interface AuditLogPayload {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  details?: any;
}

/**
 * Creates an audit log entry in the database.
 * This is a fire-and-forget utility that won't throw errors to disrupt the main flow.
 */
export async function logAudit(payload: AuditLogPayload) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? undefined;
    const userAgent = headersList.get("user-agent") ?? undefined;

    await prisma.auditLog.create({
      data: {
        action: payload.action,
        entity: payload.entity,
        entityId: payload.entityId,
        userId: payload.userId,
        details: payload.details ? JSON.parse(JSON.stringify(payload.details)) : undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // We swallow the error so that an audit logging failure doesn't break the main business logic
    console.error("[AUDIT_LOG_ERROR] Failed to save audit log:", error);
  }
}
