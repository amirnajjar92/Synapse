interface LogEntry {
  timestamp: string;
  step: string;
  duration: string;
  data: Record<string, unknown>;
}

export class PlanLogger {
  private sessionId: string;
  private entries: LogEntry[] = [];
  private startTime: number;
  private lastTime: number;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || crypto.randomUUID();
    this.startTime = Date.now();
    this.lastTime = this.startTime;
  }

  log(step: string, data: Record<string, unknown> = {}): void {
    const now = Date.now();
    const entry: LogEntry = {
      timestamp: new Date(now).toISOString(),
      step,
      duration: this.formatDuration(now - this.lastTime),
      data,
    };
    this.entries.push(entry);
    this.lastTime = now;
    this.sendToBackend(entry);
  }

  private formatDuration(ms: number): string {
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  }

  private sendToBackend(entry: LogEntry): void {
    fetch('/api/logs/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: this.sessionId, entry }),
    }).catch(() => {});
  }

  getTotalDuration(): string {
    return this.formatDuration(Date.now() - this.startTime);
  }

  getLogText(): string {
    const lines = this.entries.map((e) => {
      return `[${e.timestamp}] ${e.step} | +${e.duration} | ${JSON.stringify(e.data)}`;
    });
    return [
      `=== PLAN GENERATION LOG (${this.sessionId}) ===`,
      `Started: ${new Date(this.startTime).toISOString()}`,
      '',
      ...lines,
      '',
      `Total: ${this.getTotalDuration()}`,
      '=== END LOG ===',
    ].join('\n');
  }

  download(): void {
    const text = this.getLogText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-log-${this.sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
