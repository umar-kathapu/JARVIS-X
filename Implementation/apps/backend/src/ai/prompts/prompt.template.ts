export class PromptTemplate {
  private template: string;
  private version: string;

  constructor(template: string, version = '1.0.0') {
    this.template = template;
    this.version = version;
  }

  render(variables: Record<string, string>): string {
    let result = this.template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
    }
    return result;
  }

  getVersion(): string {
    return this.version;
  }
}
