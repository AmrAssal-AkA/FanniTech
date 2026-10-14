"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Hooks/useAuth";
import { isAuthorized } from "@/lib/auth/roles";

interface PrivateRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
    redirectTo?: string;
}

export const PrivateRoute = ({ children, allowedRoles, redirectTo = "/" }: PrivateRouteProps) => {
    const { isAuthenticated, loading, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push(redirectTo);
            } else if (!isAuthorized(role, allowedRoles)) {
                router.push("/unauthorized");
            }
        }
    }, [isAuthenticated, loading, role, router, redirectTo, allowedRoles]);

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated || !isAuthorized(role, allowedRoles)) {
        return null;
    }

    return <>{children}</>;
}