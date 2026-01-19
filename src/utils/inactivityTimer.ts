/**
 * Utility for tracking user inactivity and auto-stopping work after 30 minutes
 */

export class InactivityTimer {
  private timer: NodeJS.Timeout | null = null;
  private callback: () => void;
  private timeoutDuration: number;

  constructor(callback: () => void, timeoutMinutes: number = 30) {
    this.callback = callback;
    this.timeoutDuration = timeoutMinutes * 60 * 1000; // Convert to milliseconds
  }

  start() {
    this.reset();
  }

  reset() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.callback();
    }, this.timeoutDuration);
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
