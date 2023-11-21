import {Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property} from "@mikro-orm/core";
import {BaseEntity} from "./BaseEntity";
import {CreateRecipeStepDTO, RecipeStep} from "./RecipeStep";
import {number, object, string} from "yup";
import {CreateRecipeImageDTO, RecipeImage} from "./RecipeImage";
import {Category} from "./Category";
import {CreateIngredientRecipeDTO, IngredientRecipe} from "./IngredientRecipe";

@Entity()
export class Recipe extends BaseEntity{

    @Property()
    name: string;

    @Property()
    description: string;

    @Property()
    rating: number;

    @ManyToOne(() => Category, {nullable: true, primary: false})
    category? : Category ;

    @OneToMany(() => RecipeImage, (im) => im.image)
    recipeImages = new Collection<RecipeImage>(this);

    @OneToMany(() => RecipeStep, (rs) => rs.recipe)
    recipeSteps = new Collection<RecipeStep>(this)

    @OneToMany(() => IngredientRecipe, (r) => r.recipe)
    ingredientRecipes = new Collection<IngredientRecipe>(this);

    constructor({name, description, rating, category} : CreateRecipeDTO) {
        super();
        this.name = name;
        this.description = description;
        this.rating = rating;
        this.category = category
    }
}
export const CreateRecipeSchema = object({
    name: string().required(),
    description: string().required(),
    rating: number().required()
})


export type CreateRecipeDTO = {
    name: string;
    description: string;
    rating: number;
    category: Category;
    recipeImages?: CreateRecipeImageDTO[];
    ingredientRecipes?: CreateIngredientRecipeDTO[];
    recipeSteps?: CreateRecipeStepDTO[];
}