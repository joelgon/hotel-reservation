interface ISendMessage<T extends object> {
    body: T;
    groupId: string;
    deduplicationId: string;
    queueName: string;
}

export interface ISendMessaging {
    execute<T extends object = any>({ body, deduplicationId, groupId, queueName }: ISendMessage<T>): Promise<Boolean>
}