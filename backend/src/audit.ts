import prisma from "./prisma";

export async function logAction(
    action: string,
    targetType: string,
    targetId: number | null,
    details?: string,
    userId?: number
) {
    await prisma.auditLog.create({
        data: { action, targetType, targetId, details, userId },
    });
}