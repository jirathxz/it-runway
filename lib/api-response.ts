import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "PROFILE_INCOMPLETE"
  | "UNAUTHORIZED"
  | "SESSION_EXPIRED"
  | "FORBIDDEN"
  | "INSUFFICIENT_PERMISSIONS"
  | "NO_ORGANIZED_EVENTS"
  | "RESOURCE_NOT_FOUND"
  | "EVENT_NOT_FOUND"
  | "REGISTRATION_NOT_FOUND"
  | "BIB_NOT_FOUND"
  | "CONFLICT"
  | "ALREADY_CHECKED_IN"
  | "ALREADY_TRANSFERRED"
  | "ALREADY_CANCELLED"
  | "RATE_LIMITED"
  | "INTERNAL_SERVER_ERROR";

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: any;
  } | null;
}

export function apiSuccess<T>(data: T, status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    error: null,
  };
  return NextResponse.json(payload, { status });
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status = 400,
  details?: any
) {
  const payload: ApiResponse<null> = {
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return NextResponse.json(payload, { status });
}
