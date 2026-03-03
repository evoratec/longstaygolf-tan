import { useCallback, useRef, useState } from "react";
import {
  cadenceApi,
  type JobResultResponse,
  type SSEDetectionEvent,
  type SSEProgressEvent,
} from "@/lib/cadenceApi";

export type StreamStatus =
  | "idle"
  | "connecting"
  | "streaming"
  | "complete"
  | "error";

export interface StreamingState {
  status: StreamStatus;
  progress: SSEProgressEvent | null;
  detections: SSEDetectionEvent[];
  result: JobResultResponse | null;
  error: string | null;
  analysisType: "repository" | "website" | null;
  targetUrl: string;
}

export interface StreamingActions {
  startAnalysis: (
    type: "repository" | "website",
    url: string,
    branch?: string
  ) => void;
  cancel: () => void;
  reset: () => void;
}

const INITIAL_STATE: StreamingState = {
  status: "idle",
  progress: null,
  detections: [],
  result: null,
  error: null,
  analysisType: null,
  targetUrl: "",
};

export function useStreamingAnalysis(
  apiUrl: string
): [StreamingState, StreamingActions] {
  const [state, setState] = useState<StreamingState>(INITIAL_STATE);
  const controllerRef = useRef<AbortController | null>(null);

  const startAnalysis = useCallback(
    (type: "repository" | "website", url: string, branch?: string) => {
      controllerRef.current?.abort();

      cadenceApi.setBaseUrl(apiUrl);

      setState({
        status: "connecting",
        progress: null,
        detections: [],
        result: null,
        error: null,
        analysisType: type,
        targetUrl: url,
      });

      const callbacks = {
        onProgress: (event: SSEProgressEvent) => {
          setState((prev) => ({
            ...prev,
            status: "streaming",
            progress: event,
          }));
        },
        onDetection: (event: SSEDetectionEvent) => {
          setState((prev) => ({
            ...prev,
            status: "streaming",
            detections: [...prev.detections, event],
          }));
        },
        onResult: (result: JobResultResponse) => {
          setState((prev) => ({
            ...prev,
            status: "complete",
            result,
          }));
        },
        onError: (message: string) => {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: message,
          }));
        },
      };

      const controller =
        type === "repository"
          ? cadenceApi.streamRepository(url, branch, callbacks)
          : cadenceApi.streamWebsite(url, callbacks);

      controllerRef.current = controller;
    },
    [apiUrl]
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState((prev) => ({
      ...prev,
      status: "idle",
      error: "Analysis cancelled",
    }));
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  return [state, { startAnalysis, cancel, reset }];
}
