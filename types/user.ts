import { ApiResponsePaginated } from '@/types/api-response';
import { Params } from '@/types/params';
import { Role } from '@/types/role';

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  image: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export interface UsersResponse extends ApiResponsePaginated<User> {}

export interface UsersParams extends Params {
  roles?: string[];
}
