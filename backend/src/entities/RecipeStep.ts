import {BaseEntity} from "./BaseEntity";
import {ManyToOne, PrimaryKey, Property} from "@mikro-orm/core";
import {Recipe} from "./Recipe";
import {object, string} from 'yup';
export class RecipeStep extends BaseEntity{
    @Property()
    stepName: string;

    @Property()
    stepDescription: string;

    @ManyToOne(() => Recipe, {nullable: true, primary: false})
    recipe?: Recipe;

    constructor({stepName, stepDescription} : CreateRecipeStepDTO) {
        super();
        this.stepDescription = stepDescription;
        this.stepName = stepName
    }
}

export type CreateRecipeStepDTO = {
    stepName: string;
    stepDescription: string;
    recipe: Recipe;
}
export const CreateRecipeStepSchema = object({
    stepName: string().required(),
    stepDescription: string().required(),
})
