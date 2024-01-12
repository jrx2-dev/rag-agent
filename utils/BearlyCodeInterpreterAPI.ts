import fetch from 'node-fetch';

export class BearlyCodeInterpreterAPI {
  private api_key: string;

  constructor(api_key: string) {
    this.api_key = api_key;
  }

  private strip_markdown_code(python_code: string): string {
    // Define a regular expression to match Python code blocks in Markdown
    const regex = /```python([\s\S]*?)```/g;
    // Use the regex to find all matches in the input string
    const matches = python_code.match(regex);
    // If matches are found
    if (matches) {
      // For each match, remove the Markdown code block syntax and trim whitespace
      // Then join all code blocks into a single string with line breaks in between
      return matches
        .map((match) => match.replace(/```python|```/g, '').trim())
        .join('\n');
    } else {
      return python_code;
    }
  }

  private make_input_files(): any {
    // We don't support input files yet
    return []; // Placeholder return
  }

  public async _run(python_code: string): Promise<Record<string, any>> {
    const script: string = this.strip_markdown_code(python_code);
    const response = await fetch('https://exec.bearly.ai/v1/interpreter', {
      method: 'POST',
      body: JSON.stringify({
        fileContents: script,
        inputFiles: this.make_input_files(),
        outputDir: 'output/',
        outputAsLinks: true,
      }),
      headers: {
        Authorization: this.api_key,
        'Content-Type': 'application/json',
      },
    });
    const resp = await response.json();

    return {
      stdout: resp.stdoutBasesixtyfour
        ? Buffer.from(resp.stdoutBasesixtyfour, 'base64').toString('utf8')
        : '',
      stderr: resp.stderrBasesixtyfour
        ? Buffer.from(resp.stderrBasesixtyfour, 'base64').toString('utf8')
        : '',
      fileLinks: resp.fileLinks,
      exitCode: resp.exitCode,
    };
  }
}
