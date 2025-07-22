import { logger } from './Logger';
import { MetricsService } from './MetricsService';

interface WebhookPayload {
  type: string;
  data: any;
  timestamp: Date;
  signature?: string;
}

export class WebhookService {
  private static instance: WebhookService;
  private metrics: MetricsService;

  private constructor() {
    this.metrics = MetricsService.getInstance();
  }

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  /**
   * Send webhook with retry mechanism
   */
  public async sendWebhook(url: string, payload: WebhookPayload, maxRetries: number = 3): Promise<boolean> {
    let attempt = 1;
    const initialDelay = 1000; // 1 second

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': payload.signature || '',
            'X-Webhook-ID': this.generateWebhookId(),
            'X-Webhook-Timestamp': new Date().toISOString()
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          this.metrics.recordApiLatency(
            'POST',
            'webhook',
            response.status,
            this.metrics.startApiTimer()
          );
          logger.info('Webhook sent successfully', {
            url,
            attempt,
            status: response.status
          });
          return true;
        }

        logger.warn('Webhook request failed', {
          url,
          attempt,
          status: response.status,
          statusText: response.statusText
        });

        if (attempt === maxRetries) {
          this.metrics.recordError('webhook_failure', response.status.toString());
          return false;
        }

        // Exponential backoff
        const delay = this.calculateBackoff(attempt, initialDelay);
        await this.sleep(delay);
        attempt++;
      } catch (error) {
        logger.error('Webhook request error', error, {
          url,
          attempt
        });

        if (attempt === maxRetries) {
          this.metrics.recordError('webhook_error', 'network_error');
          return false;
        }

        // Exponential backoff
        const delay = this.calculateBackoff(attempt, initialDelay);
        await this.sleep(delay);
        attempt++;
      }
    }

    return false;
  }

  /**
   * Send webhook to multiple URLs
   */
  public async broadcastWebhook(urls: string[], payload: WebhookPayload, maxRetries: number = 3): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    await Promise.all(
      urls.map(async (url) => {
        const success = await this.sendWebhook(url, payload, maxRetries);
        results.set(url, success);
      })
    );

    return results;
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number, initialDelay: number): number {
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(
      initialDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
      maxDelay
    );
    return delay;
  }

  /**
   * Generate unique webhook ID
   */
  private generateWebhookId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 