// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.

let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 30_000;

function record(error: unknown) {
  if (!lastCapturedError) {
    lastCapturedError = { error, at: Date.now() };
  }
}

// Intercept console.error because h3 calls console.error(error) on unhandled throws
const origConsoleError = console.error;
console.error = (...args: unknown[]) => {
  for (const arg of args) {
    if (arg instanceof Error) {
      record(arg);
    } else if (typeof arg === "string" && arg.includes("Error")) {
      record(new Error(arg));
    }
  }
  origConsoleError.apply(console, args);
};

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record((event as ErrorEvent).error ?? event));
  globalThis.addEventListener("unhandledrejection", (event) =>
    record((event as PromiseRejectionEvent).reason),
  );
}

if (typeof process !== "undefined" && typeof process.on === "function") {
  process.on("uncaughtException", (error) => record(error));
  process.on("unhandledRejection", (reason) => record(reason));
}

export function consumeLastCapturedError(): unknown {
  if (!lastCapturedError) return undefined;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }
  const { error } = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}
