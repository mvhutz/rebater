export default abstract class SettingsStrategy {
  public abstract getReferencePath(name: string): string;
  public abstract getRebatePaths(time: Time): Promise<string[]>;
  public abstract getTruthPaths(time: Time): Promise<string[]>;
  public abstract getDestinationPath(name: string, time: Time): string;
  public abstract getSourcePathGlob(group: string, time: Time, extension?: string): string;
  public abstract listTransformerPaths(): Promise<string[]>;
  public abstract getTransformerPath(name: string): string;
  public abstract getOutputFile(): string;
}