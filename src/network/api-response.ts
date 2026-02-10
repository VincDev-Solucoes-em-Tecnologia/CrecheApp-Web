export interface ProblemDetails {
  title: string;
  detail: string;
  status?: number;
}

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    public error: ProblemDetails
  ) {
    super(error.title);
  }
}

export type ApiResponse<T> =
  | { data: T; error: null; isSuccess: true }
  | { data: null; error: ApiException; isSuccess: false };
