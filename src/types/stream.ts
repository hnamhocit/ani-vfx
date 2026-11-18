/**
 * Stream Source Types
 * Single Responsibility: Chỉ chứa type cho streaming providers
 */

export type StreamProvider = "phimapi" | "consumet" | "custom";
export type StreamType = "iframe" | "m3u8";

export interface StreamServer {
  id: string;
  serverName: string;
  type: StreamType;
  embedUrl: string;
  m3u8Url?: string;
  quality?: string;
  provider: StreamProvider;
}

export interface StreamResponse {
  success: boolean;
  animeName?: string;
  episode: number;
  servers: StreamServer[];
  message?: string;
}
