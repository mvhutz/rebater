declare module "*.md";

type Maybe<T> = T | undefined | null;

interface T<J> { inner: J }
type Q = T<Q>
