/**
 * Event callback type
 */
export type EventCallback<T = any> = (data: T) => void;

/**
 * Simple event dispatcher for handling events
 */
export class EventDispatcher<T = any> {
	private listeners: Set<EventCallback<T>>;

	constructor() {
		this.listeners = new Set<EventCallback<T>>();
	}

	/**
	 * Subscribe to events
	 * @param callback - Function to call when event occurs
	 */
	on(callback: EventCallback<T>): void {
		this.listeners.add(callback);
	}

	/**
	 * Unsubscribe from events
	 * @param callback - Function to remove from listeners
	 */
	unsubscribe(callback: EventCallback<T>): void {
		this.listeners.delete(callback); // Fixed: Set uses delete() not remove()
	}

	/**
	 * Trigger an event with data
	 * @param data - Data to pass to listeners
	 */
	trigger(data: T): void {
		this.listeners.forEach(x => x(data));
	}
}

/*
Based on:
https://github.com/sergiubucur/event-dispatcher/blob/master/EventDispatcher.js
 */
