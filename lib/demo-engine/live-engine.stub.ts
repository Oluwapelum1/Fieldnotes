// lib/demo-engine/live-engine.stub.ts — Optional LiveEngine adapter stub for connecting a server-side model endpoint
import type { Scenario } from '../config-schema';
import type { DemoEngine, ScheduleOptions, TimelineEvent } from './types';
import { buildTimeline } from './schedule';

export interface LiveEngineConfig {
  /**
   * Buyer-supplied server endpoint (e.g. "/api/demo-run").
   * SECURITY NOTE: Never embed model API keys in client code. Keys must live on the server,
   * requests must be rate-limited per IP/session, and showScriptedTag in site.json may only
   * be switched off while liveEngineActive is true.
   */
  serverEndpoint: string;
}

export class LiveEngineStub implements DemoEngine {
  public readonly id = 'live' as const;
  public readonly isScripted = false;
  private readonly endpoint: string;

  constructor(config: LiveEngineConfig) {
    this.endpoint = config.serverEndpoint;
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public getTimeline(scenario: Scenario, options: ScheduleOptions): TimelineEvent[] {
    // Falls back to deterministic timeline formatting on pre-fetched or server-returned scenario payload
    return buildTimeline(scenario, options);
  }
}

