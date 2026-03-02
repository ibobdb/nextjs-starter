import { EventEmitter } from 'events';

const globalForEvents = globalThis as unknown as {
  eventBus: EventEmitter | undefined;
};

// Create a singleton event bus
export const eventBus = globalForEvents.eventBus ?? new EventEmitter();

// Increase max listeners to accommodate multiple connected clients
eventBus.setMaxListeners(100);

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.eventBus = eventBus;
}
