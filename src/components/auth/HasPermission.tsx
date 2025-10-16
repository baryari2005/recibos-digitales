"use client";

import { useAuth } from "@/stores/auth";
import { can, PermissionKey } from "@/lib/rbac";

export function HasPermission({
  need,
  children,
  fallback = null,
}: {
  need: PermissionKey | PermissionKey[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();
  return can(user?.permisos, need) ? <>{children}</> : <>{fallback}</>;
}
