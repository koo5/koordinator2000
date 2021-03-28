export class EventDispatcher {
	constructor() {
		this.listeners = new Set();
	}

	on(callback) {
		this.listeners.add(callback);
	}

	unsubscribe(callback) {
		this.listeners.remove(callback);
	}

	trigger(data) {
		this.listeners.forEach(x => x(data));
	}
}
