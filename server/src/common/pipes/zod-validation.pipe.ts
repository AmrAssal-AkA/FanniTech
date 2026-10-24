import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common"
import  * as zod from "zod"

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: zod.ZodSchema) {}

    transform(value: any, _metadata: ArgumentMetadata) {
        try {
            return this.schema.parse(value);
        }catch (error) {
            if (error instanceof zod.ZodError) {
                throw new BadRequestException({
                    message: "Validation failed",
                    errors: error.issues
                })
            }
            throw error
        }
    }
}