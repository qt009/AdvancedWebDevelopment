import {BaseEntity} from "./BaseEntity";
import {Entity, ManyToOne, PrimaryKey, Property} from "@mikro-orm/core";
import {Recipe} from "./Recipe";
import {object, string} from "yup";

@Entity()
export class RecipeImage extends BaseEntity{
    @Property()
    imageName: string;

    @Property()
    imageURL: string;

    @ManyToOne(() =>Recipe)
    recipe?: Recipe;

    constructor({imageName, imageUrl, recipe} : CreateRecipeImageDTO) {
        super();
        this.imageName = imageName
        this.imageURL = imageUrl;
        this.recipe = recipe;
    }
}

export const CreateRecipeImageSchema = object ({
    imageName: string().required(),
    imageURL: string().required()
})

export type CreateRecipeImageDTO = {
    imageName: string;
    imageUrl: string;
    recipe: Recipe
}