declare module "*.md";

interface FileData {
  path: string;
  raw: Buffer;
}

type Maybe<T> = T | undefined | null;

interface T<J> { inner: J }
type Q = T<Q>
