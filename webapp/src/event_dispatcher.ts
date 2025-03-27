type Callback<T = any> = (data?: T) => void;

export class EventDispatcher<T = any> {
  private listeners: Set<Callback<T>>;

  constructor() {
    this.listeners = new Set();
  }

  on(callback: Callback<T>): void {
    this.listeners.add(callback);
  }

  unsubscribe(callback: Callback<T>): void {
    this.listeners.delete(callback);
  }

  trigger(data?: T): void {
    this.listeners.forEach(x => x(data));
  }
}

/*
https://github.com/sergiubucur/event-dispatcher/blob/master/EventDispatcher.js
*/