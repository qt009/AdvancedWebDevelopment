import {Entity, ManyToOne, Property} from "@mikro-orm/core";
import {Recipe} from "./Recipe";
import {Ingredient} from "./Ingredient";
import {number, object, string} from "yup";

@Entity()
export class IngredientRecipe{
    @Property()
    amount: number;

    @Property()
    unit: string;

    @ManyToOne(() => Recipe, { nullable: true, primary: true })
    recipe?: Recipe;

    @ManyToOne(() => Ingredient, { nullable: true, primary: true })
    ingredient: Ingredient;

    constructor({ amount, unit, recipe, ingredient }: CreateIngredientRecipeDTO) {
        this.amount = amount;
        this.unit = unit;
        this.recipe = recipe;
        this.ingredient = ingredient;
    }
}

export const CreateIngredientRecipeSchema = object({
    amount: number().required(),
    unit: string().required(),
    ingredient: object().required()
});

export type CreateIngredientRecipeDTO = {
    amount: number;
    unit: string;
    ingredient: Ingredient;
    recipe?: Recipe;
};