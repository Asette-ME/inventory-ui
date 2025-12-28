"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { UsersParams } from "@/types/user";

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

export function useUsersParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params: UsersParams = useMemo(() => {
    const roles = searchParams.getAll("roles");
    return {
      search: searchParams.get("search") || undefined,
      sort_by: searchParams.get("sort_by") || undefined,
      sort_order: (searchParams.get("sort_order") as "asc" | "desc") || undefined,
      limit: Number(searchParams.get("limit")) || DEFAULT_LIMIT,
      page: Number(searchParams.get("page")) || DEFAULT_PAGE,
      roles: roles.length > 0 ? roles : undefined,
    };
  }, [searchParams]);

  const setParams = useCallback(
    (newParams: Partial<UsersParams>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (key === "roles" && Array.isArray(value)) {
          current.delete("roles");
          value.forEach((v) => current.append("roles", v));
        } else if (value === undefined || value === null || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      // Reset to page 1 when filters change (except when changing page itself)
      if (!("page" in newParams)) {
        current.set("page", "1");
      }

      router.push(`${pathname}?${current.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const resetParams = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return { params, setParams, resetParams };
}
