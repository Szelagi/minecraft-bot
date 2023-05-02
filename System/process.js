export class Process {
    #proceses = [];
    #resolve;
    #reject;
    #onResolve;
    #onReject;
    constructor(resolve, reject, onResolve = ()=>{}, onReject = ()=>{}) {
        this.#resolve = resolve;
        this.#reject = reject;
        this.#onResolve = onResolve;
        this.#onReject = onReject;
    }
    createTask(func, delay) {
        this.#proceses.push(
            setInterval(() => func(this), delay)
        );
    }
    stop() {
        this.#proceses.forEach(e => clearInterval(e));
    }
    resolve() {
        this.stop();
        this.#onResolve();
        this.#resolve();
    }
    reject() {
        this.stop();
        this.#onReject();
        this.#reject();
    }
}