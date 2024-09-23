import { ReadStream } from 'fs';
interface File {
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash: string;
  ext?: string;
  mime: string;
  size: number;
  sizeInBytes: number;
  url: string;
  previewUrl?: string;
  path?: string;
  provider?: string;
  provider_metadata?: Record<string, unknown>;
  stream?: ReadStream;
  buffer?: Buffer | Uint8Array;
}

interface CheckFileSizeOptions {
  sizeLimit?: number;
}

export interface UpstreamProviderConfiguration {
  provider: string;
  providerOptions: unknown;
  actionOptions: unknown;
}

export interface UploadProviderInstance {
  checkFileSize?(file: File, options: CheckFileSizeOptions): void;
  uploadStream?(file: File, customParams?: unknown): Promise<void>;
  upload(file: File, customParams?: unknown): Promise<void>;
  delete(file: File, customParams?: unknown): Promise<string | void>;
  isPrivate?(): boolean;
  getSignedUrl?(file: File, customParams?: unknown): string;
}

export interface TinifyOptions {
  apiKey: string;
  upstream: UpstreamProviderConfiguration;
}

export interface UploadProvider<TOptions> {
  init(options?: TOptions): UploadProviderInstance;
}
