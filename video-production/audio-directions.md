svelte
<script lang="ts">
  import { onDestroy } from 'svelte';

  /* ───────────────────────────── Types ───────────────────────────── */

  /** Settlement state of a {@link ControllablePromise}. */
  type Settlement = 'pending' | 'fulfilled' | 'rejected';

  /** A promise whose settlement is driven externally by the harness. */
  interface ControllablePromise<T> {
    readonly promise: Promise<T>;
    readonly label: string;
    readonly settlement: Settlement;
    resolve(value: T): boolean;
    reject(reason: unknown): boolean;
  }

  /** A single logged event. */
  interface LogEntry {
    readonly timestamp: string;
    readonly level: LogLevel;
    readonly message: string;
    readonly context: Readonly<Record<string, unknown>>;
  }

  type LogLevel = 'debug' | 'info' | 'warn' | 'error';
  type LogSink = (entry: LogEntry) => void;

  /** Error thrown when caller-supplied data fails validation. */
  class ValidationError extends Error {
    readonly field: string;
    constructor(field: string, detail: string) {
      super(`Validation failed for "${field}": ${detail}`);
      this.name = 'ValidationError';
      this.field = field;
    }
  }

  /** Error thrown when a promise is settled in an invalid way. */
  class AsyncResolutionError extends Error {
    readonly label: string;
    constructor(label: string, detail: string) {
      super(`Async resolution failed for "${label}": ${detail}`);
      this.name = 'AsyncResolutionError';
      this.label = label;
    }
  }

  /** Error thrown when the rendered triple diverges from the expected triple. */
  class StateConsistencyError extends Error {
    readonly expected: string;
    readonly actual: string;
    constructor(expected: string, actual: string) {
      super(`UI divergence detected — expected "${expected}", observed "${actual}".`);
      this.name = 'StateConsistencyError';
      this.expected = expected;
      this.actual = actual;
    }
  }