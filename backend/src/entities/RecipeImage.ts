import {BaseEntity} from "./BaseEntity";
import {Entity, ManyToOne, Property} from "@mikro-orm/core";
import {Recipe} from "./Recipe";
import {object, string} from "yup";

@Entity()
export class RecipeImage extends BaseEntity{
    @Property()
    imageURL: string;

    @ManyToOne(() =>Recipe)
    recipe?: Recipe;

    constructor({image, recipe} : CreateRecipeImageDTO) {
        super();
        this.imageURL = image;
        this.recipe = recipe;
    }
}

export const CreateRecipeImageSchema = object ({
    imageURL: string().required()
})

export type CreateRecipeImageDTO = {
    image: string;
    recipe: Recipe
}