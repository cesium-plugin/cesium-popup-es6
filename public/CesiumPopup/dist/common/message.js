export class MessageArgs extends Object {
}
export class Message {
    constructor() {
        this._recipients = {};
    }
    register(message, action) {
        let actions = this._recipients[message];
        if (!actions) {
            actions = [];
            this._recipients[message] = actions;
        }
        actions.push(action);
    }
    sendMessage(message, args) {
        let actions = this._recipients[message];
        if (!actions) {
            return;
        }
        actions.map((v) => v(message, args));
    }
    unregister(message, action) {
        let actions = this._recipients[message];
        if (!actions) {
            return;
        }
        let idx = actions.findIndex((v) => v === action);
        if (idx) {
            actions.splice(idx, 1);
        }
    }
}
Message.default = new Message();
