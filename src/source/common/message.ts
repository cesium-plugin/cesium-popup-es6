export class MessageArgs extends Object {
}

type actionHandler = (message: string, args?: MessageArgs) => void;

export class Message {

    static default: Message  = new Message();
    private readonly _recipients: { [key: string]: actionHandler[] };
    constructor() {
        this._recipients = {};
    }

    public register(message: string, action: actionHandler) {
        let actions = this._recipients[message];
        if (!actions) {
            actions = [];
            this._recipients[message] = actions;
        }

        actions.push(action);
    }

    public sendMessage(message: string, args?: MessageArgs) {
        let actions = this._recipients[message];
        if (!actions) {
            return;
        }

        actions.map((v) => v(message, args));
    }

    public unregister(message: string, action: any) {
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