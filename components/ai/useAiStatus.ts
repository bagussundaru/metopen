"use client";

import { useState, useEffect } from "react";

export interface AiStatus {
  enabled: boolean;
  model: string | null;
  rateLimitPerHour: number;
  loading: boolean;
}

export function useAiStatus() {
  const [status, setStatus] = useState<AiStatus>({
    enabled: false,
    model: null,
    rateLimitPerHour: 30,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setStatus({
            enabled: Boolean(data.enabled),
            model: data.model || null,
            rateLimitPerHour: data.rateLimitPerHour || 30,
            loading: false,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus({
            enabled: false,
            model: null,
            rateLimitPerHour: 30,
            loading: false,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return status;
}
