import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

/**
 * Safe fetch wrapper for tRPC
 * Validates response before allowing tRPC to process it
 * Handles empty responses, invalid content-type, and network errors
 */
const safeTRPCFetch = async (input: string | Request, init?: RequestInit) => {
  try {
    const response = await globalThis.fetch(input, {
      ...(init ?? {}),
      credentials: "include",
    });

    // Check response.ok
    if (!response.ok) {
      // Try to extract error message from response
      let errorMessage = `HTTP ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const text = await response.text();
          if (text?.trim()) {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorData.error || errorMessage;
          }
        } else if (response.status === 204) {
          // 204 No Content is valid for some endpoints
          return response;
        }
      } catch (parseError) {
        // Ignore parse errors, use default error message
      }
      
      // Return error response (tRPC will handle it)
      return response;
    }

    // Check Content-Type for non-204 responses
    if (response.status !== 204) {
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        // Return response as-is, tRPC will handle the error
        return response;
      }

      // Check if response has content
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') {
        // Empty response - create valid JSON response
        return new Response(JSON.stringify(null), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }

      // Verify body is not empty by reading and re-wrapping
      const text = await response.text();
      if (!text?.trim()) {
        // Empty response - create valid JSON response
        return new Response(JSON.stringify(null), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }

      // Validate it's valid JSON before returning
      try {
        JSON.parse(text);
      } catch (parseError) {
        console.error('[tRPC] Invalid JSON response:', text.substring(0, 200));
        // Return response with original body for tRPC to handle
        return new Response(text, {
          status: response.status,
          headers: response.headers,
        });
      }

      // Return wrapped response with text content
      return new Response(text, {
        status: response.status,
        headers: response.headers,
      });
    }

    // 204 No Content is valid
    return response;
  } catch (error) {
    // Network error - let it propagate
    console.error('[tRPC] Network error:', error);
    throw error;
  }
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch: safeTRPCFetch,
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
