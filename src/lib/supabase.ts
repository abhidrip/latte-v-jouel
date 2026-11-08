import { createClient } from '@supabase/supabase-js';

// Polyfill minimal WebSocket for serverless runtimes (e.g. Node < 22 on Netlify)
// where native WebSocket is absent. The web client uses the browser's native WebSocket.
class DummyWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = 3;
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}

if (typeof globalThis !== 'undefined' && typeof globalThis.WebSocket === 'undefined') {
  // @ts-ignore
  globalThis.WebSocket = DummyWebSocket;
}

const wsTransport =
  typeof WebSocket !== 'undefined'
    ? WebSocket
    : typeof globalThis !== 'undefined' && globalThis.WebSocket
      ? globalThis.WebSocket
      : DummyWebSocket;

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  import.meta.env.VITE_SUPABASE_URL ||
  'https://funbtudlvyvxweduqzrm.supabase.co';

const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_pFNBEndgp55azbQQ1Lkbyw_r8QcA1LE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
  },
  realtime: {
    transport: wsTransport,
  },
});
