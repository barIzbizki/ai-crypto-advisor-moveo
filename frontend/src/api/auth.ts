import { apiClient } from './client'

export interface AuthUser {
  id: number
  email: string
  created_at: string
}

export interface AuthToken {
  access_token: string
  token_type: string
}

export function registerUser(email: string, password: string): Promise<AuthUser> {
  return apiClient.post<AuthUser>('/auth/register', { email, password })
}

export function login(email: string, password: string): Promise<AuthToken> {
  return apiClient.post<AuthToken>('/auth/login', { email, password })
}

export function getCurrentUser(token: string): Promise<AuthUser> {
  return apiClient.get<AuthUser>('/auth/me', token)
}
