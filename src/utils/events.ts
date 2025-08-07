type EventMap = {
  'product:updated': { productId: string; sections?: string[] }
  'compilation:queued': { productId: string; type: string }
  'compilation:started': { productId: string; type: string; jobId?: string }
  'compilation:completed': { productId: string; type: string }
  'compilation:failed': { productId: string; type: string; error: string }
}

const channelName = 'bn:events'

export class EventBus {
  private channel: BroadcastChannel | null

  constructor() {
    this.channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel(channelName)
      : null
  }

  publish<K extends keyof EventMap>(name: K, payload: EventMap[K]) {
    if (!this.channel) return
    this.channel.postMessage({ name, payload, ts: Date.now() })
  }

  subscribe<K extends keyof EventMap>(
    name: K,
    handler: (payload: EventMap[K]) => void
  ): () => void {
    if (!this.channel) return () => {}
    const listener = (evt: MessageEvent) => {
      if (evt.data?.name === name) handler(evt.data.payload as EventMap[K])
    }
    this.channel.addEventListener('message', listener)
    return () => this.channel?.removeEventListener('message', listener)
  }
}

export const eventBus = new EventBus()


