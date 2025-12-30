import { AsyncMessagePort } from "./AsyncMessagePort.js";

export class AsyncMessageChannel {
    #messageChannel
    #port1
    #port2

    constructor() {
        this.#messageChannel = new MessageChannel();
        this.#port1 = new AsyncMessagePort(this.#messageChannel.port1);
        this.#port2 = new AsyncMessagePort(this.#messageChannel.port2);
    }

    get port1() {
        return this.#port1;
    }

    get port2() {
        return this.#port2;
    }
}
