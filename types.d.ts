declare module "*.md";

interface FileData {
  path: string;
  raw: Buffer;
}

type Maybe<T> = T | undefined | null;
