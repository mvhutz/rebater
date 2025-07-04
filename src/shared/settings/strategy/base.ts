export default abstract class SettingsStrategy {
  public abstract getReferencePath(name: string): string;
  public abstract listDestinationPaths(group: string, subgroup: string): Promise<string[]>;
  public abstract getDestinationPath(filepath: string, group: string, subgroup: string, time: Time): string;
  public abstract listExpectedGroups(): Promise<string[]>;
  public abstract listExpectedPaths(group: string): Promise<string[]>;
  public abstract listActualGroups(): Promise<string[]>;
  public abstract listActualPaths(group: string): Promise<string[]>;
  public abstract listSourcePaths(group: string, subgroup: string, time: Time, extension?: string): Promise<string[]>;
  public abstract listTransformerPaths(): Promise<string[]>;
  public abstract getTransformerPath(name: string): string;
  public abstract getOutputFile(): string;
}