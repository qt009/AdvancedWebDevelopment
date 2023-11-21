import {BaseEntity} from "./BaseEntity";
import {Entity, ManyToOne, Property} from "@mikro-orm/core";
import {Recipe} from "./Recipe";
import {object} from "yup";

@Entity()
export class RecipeImage extends BaseEntity{
    @Property()
    image: HTMLImageElement;

    @ManyToOne(() =>Recipe)
    recipe?: Recipe;

    constructor({image, recipe} : CreateRecipeImageDTO) {
        super();
        this.image = image;
        this.recipe = recipe;
    }
}

export const CreateRecipeImageSchema = object ({

})

export type CreateRecipeImageDTO = {
    image: HTMLImageElement;
    recipe: Recipe
}