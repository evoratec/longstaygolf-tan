/**
 * Cadence API Client
 * Handles communication with the Cadence analysis server.
 * Supports both polling-based and SSE streaming analysis.
 */

export interface AnalyzeRepositoryRequest {
  repository_url: string;
  branch?: string;
}

export interface AnalyzeWebsiteRequest {
  url: string;
}

export interface AnalysisResponse {
  job_id: string;
  status: string;
}

export interface Suspicion {
  commit_hash: string;
  commit_index: number;
  message: string;
  severity: string;
  reasons: string[];
  score: number;
}

export interface WebPattern {
  type: string;
  severity: number;
  description: string;
  examples?: string[];
  passed?: boolean;
}

export interface JobResultResponse {
  job_id: string;
  status: string;
  error?: string;
  progress?: string;
  // Repository fields
  repo_name?: string;
  total_commits?: number;
  suspicious_commits?: number;
  suspicions?: Suspicion[];
  velocity?: string;
  time_span?: string;
  unique_authors?: number;
  average_commit_size?: number;
  overall_suspicion?: number;
  // Website fields
  url?: string;
  word_count?: number;
  character_count?: number;
  heading_count?: number;
  headings?: string[];
  quality_score?: number;
  confidence_score?: number;
  suspicion_rate?: number;
  pattern_count?: number;
  assessment?: string;
  web_patterns?: WebPattern[];
  passed_patterns?: WebPattern[];
  // Cross-source metrics
  items_analyzed?: number;
  items_flagged?: number;
  strategies_used?: number;
  strategies_hit?: number;
  average_score?: number;
  coverage_rate?: number;
  // Common
  analyzed_at?: string;
}

export enum JobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

// ---------------------------------------------------------------------------
// SSE Streaming Types
// ---------------------------------------------------------------------------

export interface SSEProgressEvent {
  phase: string;
  message: string;
  current?: number;
  total?: number;
  elapsed_ms?: number;
  percent?: number;
}

export interface SSEDetectionEvent {
  strategy: string;
  detected: boolean;
  severity: string;
  score: number;
  category: string;
  description: string;
  examples?: string[];
}

export type StreamEventType = "progress" | "detection" | "result" | "error";

export interface StreamCallbacks {
  onProgress?: (event: SSEProgressEvent) => void;
  onDetection?: (event: SSEDetectionEvent) => void;
  onResult?: (result: JobResultResponse) => void;
  onError?: (error: string) => void;
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

class CadenceAPI {
  private baseUrl: string;
  private pollInterval = 2000;
  private maxPollAttempts = 300;

  constructor(baseUrl: string = import.meta.env.VITE_CADENCE_API_URL || "http://localhost:8000") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  // ---- Legacy polling endpoints (kept for backward compatibility) ---- //

  async analyzeRepository(repositoryUrl: string, branch?: string): Promise<AnalysisResponse> {
    const request: AnalyzeRepositoryRequest = {
      repository_url: repositoryUrl,
      ...(branch && { branch }),
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/analyze/repository`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Failed to start repository analysis: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Unable to connect to Cadence API at ${this.baseUrl}. The API server may be offline or unreachable.`
        );
      }
      throw error;
    }
  }

  async analyzeWebsite(url: string): Promise<AnalysisResponse> {
    const request: AnalyzeWebsiteRequest = { url };

    try {
      const response = await fetch(`${this.baseUrl}/api/analyze/website`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Failed to start website analysis: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Unable to connect to Cadence API at ${this.baseUrl}. The API server may be offline or unreachable.`
        );
      }
      throw error;
    }
  }

  async getJobResults(
    jobId: string,
    onProgress?: (result: JobResultResponse) => void
  ): Promise<JobResultResponse> {
    let attempts = 0;

    while (attempts < this.maxPollAttempts) {
      const result = await this.getJobStatus(jobId);

      if (onProgress) onProgress(result);

      if (result.status?.toLowerCase() === "completed") return result;
      if (result.status?.toLowerCase() === "failed") {
        throw new Error(`Analysis failed: ${result.error}`);
      }

      await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
      attempts++;
    }

    throw new Error("Analysis polling timeout");
  }

  async getJobStatus(jobId: string): Promise<JobResultResponse> {
    const response = await fetch(`${this.baseUrl}/api/results/${jobId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch job status: ${response.statusText}`);
    }
    return response.json();
  }

  // ---- SSE Streaming endpoints ---- //

  /**
   * Stream repository analysis via SSE.
   * Returns an AbortController so the caller can cancel the stream.
   */
  streamRepository(
    repositoryUrl: string,
    branch: string | undefined,
    callbacks: StreamCallbacks
  ): AbortController {
    const controller = new AbortController();

    const body = JSON.stringify({
      repository_url: repositoryUrl,
      ...(branch && { branch }),
    } satisfies AnalyzeRepositoryRequest);

    this.connectSSE(`${this.baseUrl}/api/stream/repository`, body, callbacks, controller);
    return controller;
  }

  /**
   * Stream website analysis via SSE.
   * Returns an AbortController so the caller can cancel the stream.
   */
  streamWebsite(url: string, callbacks: StreamCallbacks): AbortController {
    const controller = new AbortController();

    const body = JSON.stringify({ url } satisfies AnalyzeWebsiteRequest);

    this.connectSSE(`${this.baseUrl}/api/stream/website`, body, callbacks, controller);
    return controller;
  }

  /**
   * Internal: POST to SSE endpoint and parse the event stream.
   * We use fetch() because EventSource only supports GET.
   */
  private async connectSSE(
    url: string,
    body: string,
    callbacks: StreamCallbacks,
    controller: AbortController
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        callbacks.onError?.(`Analysis request failed: ${errorText}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        callbacks.onError?.("No response body — streaming not supported");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let receivedTerminalEvent = false; // tracks whether we got a result or error event

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by double-newline
        const messages = buffer.split("\n\n");
        // Keep the last partial chunk in the buffer
        buffer = messages.pop() || "";

        for (const msg of messages) {
          if (!msg.trim()) continue;

          let eventType = "";
          let data = "";

          for (const line of msg.split("\n")) {
            // Skip SSE comments (keepalive heartbeats)
            if (line.startsWith(":")) continue;
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              data = line.slice(6);
            }
          }

          if (!eventType || !data) continue;

          try {
            const parsed = JSON.parse(data);

            switch (eventType as StreamEventType) {
              case "progress":
                callbacks.onProgress?.(parsed as SSEProgressEvent);
                break;
              case "detection":
                callbacks.onDetection?.(parsed as SSEDetectionEvent);
                break;
              case "result":
                receivedTerminalEvent = true;
                callbacks.onResult?.(parsed as JobResultResponse);
                break;
              case "error":
                receivedTerminalEvent = true;
                callbacks.onError?.(parsed.message || "Unknown error");
                break;
            }
          } catch {
            // Ignore malformed JSON
          }
        }
      }

      // Stream ended — if we never received a result or error event, the
      // server closed the connection without completing the analysis.
      if (!receivedTerminalEvent) {
        callbacks.onError?.(
          "The analysis stream ended unexpectedly without returning results. Please try again."
        );
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Intentional cancellation — don't report as error
        return;
      }
      const message = err instanceof Error ? err.message : "Stream connection failed";

      // Detect network-level errors across different browsers:
      //   Chrome: "Failed to fetch", "network error"
      //   Firefox: "NetworkError when attempting to fetch resource."
      //   Safari: "The Internet connection appears to be offline.", "Load failed"
      const lowerMessage = message.toLowerCase();
      const isNetworkError =
        lowerMessage.includes("network") ||
        lowerMessage.includes("failed to fetch") ||
        lowerMessage.includes("load failed") ||
        lowerMessage.includes("internet connection") ||
        lowerMessage.includes("net::");

      if (isNetworkError) {
        callbacks.onError?.(
          "The connection to the server was lost. The analysis may still be running — please try again."
        );
      } else {
        callbacks.onError?.(message);
      }
    }
  }

  // ---- Utilities ---- //

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, "");
  }

  setPollInterval(interval: number) {
    this.pollInterval = interval;
  }
}

// Export singleton instance
export const cadenceApi = new CadenceAPI();
