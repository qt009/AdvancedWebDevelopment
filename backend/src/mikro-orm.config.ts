import {Options} from "@mikro-orm/mysql";
import {Category} from "./entities/Category";
import {Ingredient} from "./entities/Ingredient";
import {IngredientRecipe} from "./entities/IngredientRecipe";
import {Recipe} from "./entities/Recipe";
import {RecipeImage} from "./entities/RecipeImage";
import {RecipeStep} from "./entities/RecipeStep";

const options : Options ={
    type: 'mysql',
    entities: [Category, Ingredient, IngredientRecipe, Recipe, RecipeImage, RecipeStep],
    dbName: 'FWE_DATABASE',
    password: 'dev',
    user: 'localdev',
    debug: true
};

export default options;