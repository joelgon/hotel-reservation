export interface IGetFile {
    execute({ bucket, key }: { bucket: string, key: string }): Promise<Uint8Array>;
}