import { ClientSession } from "mongoose";
import { ExtractModel } from "../model/extract.model";

export class ExtractRepository {
    async create(extract, session?: ClientSession) {
        const extractModel = new ExtractModel(extract);
        return (await extractModel.save({ session })).toObject();
    }
}