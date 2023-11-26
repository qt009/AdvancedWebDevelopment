import express from 'express';
import http from 'http';
import { EntityManager, EntityRepository, MikroORM, RequestContext } from '@mikro-orm/core';
import {Category} from "./entities/Category";
import {Ingredient} from "./entities/Ingredient";
import {IngredientRecipe} from "./entities/IngredientRecipe";
import {Recipe} from "./entities/Recipe";
import {RecipeImage} from "./entities/RecipeImage";
import {RecipeStep} from "./entities/RecipeStep";
import {CategoryController} from "./controller/category.controller";
import {IngredientController} from "./controller/ingredient.controller";
import {IngredientRecipeController} from "./controller/ingredientRecipe.controller";
import {RecipeController} from "./controller/recipe.controller";
import {RecipeImageController} from "./controller/recipeImage.controller";
import {RecipeStepController} from "./controller/recipeStep.controller";

const PORT = 3000;
const app = express();
import cors from 'cors';


export const DI = {} as {
    server: http.Server;
    orm: MikroORM;
    em: EntityManager;
    categoryRepository: EntityRepository<Category>
    ingredientRepository: EntityRepository<Ingredient>
    ingredientRecipeRepository: EntityRepository<IngredientRecipe>
    recipeRepository: EntityRepository<Recipe>
    recipeImageRepository: EntityRepository<RecipeImage>
    recipeStepRepository: EntityRepository<RecipeStep>
};

export const initializeServer = async () => {
    // dependency injection setup
    DI.orm = await MikroORM.init();
    DI.em = DI.orm.em;
    DI.categoryRepository = DI.orm.em.getRepository(Category);
    DI.ingredientRepository = DI.orm.em.getRepository(Ingredient);
    DI.ingredientRecipeRepository = DI.orm.em.getRepository(IngredientRecipe);
    DI.recipeRepository = DI.orm.em.getRepository(Recipe);
    DI.recipeImageRepository = DI.orm.em.getRepository(RecipeImage);
    DI.recipeStepRepository = DI.orm.em.getRepository(RecipeStep);

    app.use(cors());
    // example middleware
    app.use((req, res, next) => {
        console.info(`New request to ${req.path}`);
        next();
    });

    // global middleware
    app.use(express.json());
    app.use((req, res, next) => RequestContext.create(DI.orm.em, next));

    // routes
    app.use('/categories', CategoryController);
    app.use('/ingredients', IngredientController);
    app.use('/ingredientRecipes', IngredientRecipeController);
    app.use('/recipes', RecipeController);
    app.use('/recipeImages', RecipeImageController);
    app.use('/recipeSteps', RecipeStepController);

    DI.server = app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
};

if (process.env.environment !== 'test') {
    initializeServer();
}

