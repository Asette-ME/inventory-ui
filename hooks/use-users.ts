'use client';

import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/components/providers/auth-provider';
import { api } from '@/lib/api';
import { Pagination } from '@/types/pagination';
import { User, UsersParams, UsersResponse } from '@/types/user';

interface UseUsersReturn {
  users: User[];
  pagination: Pagination | null;
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function buildQueryString(params: UsersParams): string {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set('search', params.search);
  if (params.sort_by) queryParams.set('sort_by', params.sort_by);
  if (params.sort_order) queryParams.set('sort_order', params.sort_order);
  if (params.limit) queryParams.set('limit', String(params.limit));
  if (params.page) queryParams.set('page', String(params.page));
  if (params.roles) {
    params.roles.forEach((role) => queryParams.append('roles', role));
  }
  return queryParams.toString();
}

export function useUsers(params: UsersParams): UseUsersReturn {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = buildQueryString(params);
  const lastFetchedQuery = useRef<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get(`/user?${queryString}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to fetch users');
      }

      const response: UsersResponse = await res.json();
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    // Only fetch if query changed
    if (lastFetchedQuery.current === queryString) return;
    lastFetchedQuery.current = queryString;

    fetchUsers();
  }, [queryString, authLoading, isAuthenticated]);

  return {
    users,
    pagination,
    isLoading,
    isInitialLoading,
    error,
    refetch: fetchUsers,
  };
}
