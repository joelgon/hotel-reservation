export interface ILockItemRepository {
    create(_id: string): Promise<object | undefined>;
    delete(_id: string): Promise<void>;
}