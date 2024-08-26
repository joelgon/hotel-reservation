import { ClientSession } from "mongoose";
import { extractCreateEntity, extractEntity } from "../entities/extract.entity";

export interface IExtractRepository {
    create(extract: extractCreateEntity, session?: ClientSession): Promise<extractEntity>;
}