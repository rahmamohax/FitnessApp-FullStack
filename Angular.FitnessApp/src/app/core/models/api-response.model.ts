/**
 * Unified API Response Envelope matching BuildingBlocks.Shared.Responses.ApiResponse<T>
 */
export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errors?: Record<string, string[]>;
  statusCode: number;
  timestamp: string;
}
