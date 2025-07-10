interface BadReply {
  ok: false;
  reason: string;
  message?: string;
}

export function bad(reason: string, message?: string): BadReply {
  return { ok: false, reason, message };
}

interface GoodReply<T> {
  ok: true;
  data: T;
  message?: string;
}

export function good<T>(data: T, message?: string): GoodReply<T> {
  return { ok: true, data, message };
}

export type Reply<T> = BadReply | GoodReply<T>;
