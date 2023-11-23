import {Collection, Entity, OneToMany, PrimaryKey, Property} from "@mikro-orm/core";
import {object, string} from "yup";
import {CreateIngredientRecipeDTO, IngredientRecipe} from "./IngredientRecipe";
import {BaseEntity} from "./BaseEntity";

@Entity()
export class Ingredient extends BaseEntity{
    @Property()
    name: string;

    @Property()
    description: string;

    @Property()
    link: string;

    @OneToMany(() => IngredientRecipe, (i) => i.ingredient)
    ingredientRecipes = new Collection<IngredientRecipe>(this);


    constructor({ name, description, link }: CreateIngredientDTO) {
        super();
        this.name = name;
        this.description = description;
        this.link = link;
    }
}

export const CreateIngredientSchema = object({
    name: string().required(),
    description: string().required(),
    link: string().required()
});

export type CreateIngredientDTO = {
    name: string;
    description: string;
    link: string;
    ingredientRecipes?: CreateIngredientRecipeDTO[];
};