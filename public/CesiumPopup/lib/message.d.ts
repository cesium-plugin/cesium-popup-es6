export declare class MessageArgs extends Object {
}
declare type actionHandler = (message: string, args?: MessageArgs) => void;
export declare class Message {
    static default: Message;
    private readonly _recipients;
    constructor();
    register(message: string, action: actionHandler): void;
    sendMessage(message: string, args?: MessageArgs): void;
    unregister(message: string, action: any): void;
}
export {};
