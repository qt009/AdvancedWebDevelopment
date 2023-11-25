import {Router} from 'express';

import {wrap} from '@mikro-orm/core';

import {DI} from '../';
import {CreateRecipeSchema, CreateRecipeDTO, Recipe} from "../entities/Recipe";
import {CreateIngredientRecipeSchema, IngredientRecipe} from "../entities/IngredientRecipe";
import {CreateIngredientDTO, Ingredient} from "../entities/Ingredient";
import {Category, CreateCategorySchema, CreateCategoryDTO} from "../entities/Category";
import {CreateRecipeStepSchema, RecipeStep} from "../entities/RecipeStep";
import {RecipeImage} from "../entities/RecipeImage";

const router = Router({mergeParams: true});

router.get('/:name', async (req, res) => {
    const {name} = req.params;
    try {
        const em = DI.em.fork();

        const recipe = await em.getRepository(Recipe).findOne(
            {name: name,},
            {populate: ['ingredientRecipes', 'recipeSteps']},);

        if (!recipe) {
            return res.status(400).send({errors: ['Recipe doesnt exists']});
        }

        res.status(200).send(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Get recipes with given ratings
 */
router.get('/rating/:rating', async (req, res) => {
    const {rating} = req.params;
    //TODO fix rating round up error
    try {
        const em = DI.em.fork();
        const recipes = await em.getRepository(Recipe).find(
            {rating: parseFloat(rating)}
        );

        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.post('/', async (req, res) => {
    try {
        const validatedData = await CreateRecipeSchema.validate(req.body).catch((e) => {
            res.status(400).send({errors: e.errors});
        });

        if (!validatedData) {
            return;
        }

        const CreateRecipeDTO: CreateRecipeDTO = {
            ...validatedData,
        }
        console.log(req.body)
        const em = DI.em.fork();

        const existingRecipe = await em.getRepository(Recipe).findOne({
            name: validatedData.name,
        });

        if (existingRecipe) {
            return res.status(400).send({errors: ['Recipe already exists']});
        }

        const newRecipe = new Recipe(CreateRecipeDTO);

        //add to ingredients & ingredientRecipes
        if (CreateRecipeDTO.ingredientRecipes) {
            for (const ir of CreateRecipeDTO.ingredientRecipes) {
                const validatedData = await CreateIngredientRecipeSchema.validate(ir).catch((e) => {
                    res.status(400).send({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                ir.recipe = newRecipe;
                let existingIngredient = await em.getRepository(Ingredient).findOne({
                    name: ir.ingredient.name
                });

                if (!existingIngredient) {
                    const CreateIngredientDTO: CreateIngredientDTO = {
                        name: ir.ingredient.name,
                        description: ir.ingredient.description,
                        link: ir.ingredient.link,
                    };
                    existingIngredient = new Ingredient(CreateIngredientDTO);
                }
                ir.ingredient = existingIngredient;
                newRecipe.ingredientRecipes.add(new IngredientRecipe(ir));
            }
        } else {
            return res.status(400).send({errors: ['Missing ingredient']});
        }

        //add to category
        if (CreateRecipeDTO.category) {
            let cr = CreateRecipeDTO.category
            const validatedData = await CreateCategorySchema.validate(cr).catch((e) => {
                res.status(400).send({errors: e.errors});
            });
            if (!validatedData) {
                return;
            }

            let existingCategory = await em.getRepository(Category).findOne({
                name: cr.name
            });

            if (!existingCategory) {
                const CreateCategoryDTO: CreateCategoryDTO = {
                    name: cr.name,
                };
                existingCategory = new Category(CreateCategoryDTO);
            }


            existingCategory.recipes.add(newRecipe)
            newRecipe.category = existingCategory;

        } else {
            return res.status(400).send({errors: ['Missing category']});
        }
        //add to recipeSteps
        if (CreateRecipeDTO.recipeSteps) {
            for (const rs of CreateRecipeDTO.recipeSteps) {
                const validatedData = await CreateRecipeStepSchema.validate(rs).catch((e) => {
                    res.status(400).send({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                rs.recipe = newRecipe;
                newRecipe.recipeSteps.add(new RecipeStep(rs));
            }
        } else {
            return res.status(400).send({errors: ['Missing recipe steps']});
        }

        await em.persistAndFlush(newRecipe);

        return res.status(201).send(newRecipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.put('/:name', async (req, res) => {
    const {name} = req.params;

    try {
        const em = DI.orm.em.fork();
        const recipe = await em.getRepository(Recipe).findOne(
            {name},
            {populate: ['ingredientRecipes', 'category', 'recipeSteps']},
        );

        if (!recipe) {
            return res.status(404).send({error: 'Recipe is not found'});
        }

        const validatedData = await CreateRecipeSchema.validate(req.body,
            {stripUnknown: true,}
        ).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }

        Object.assign(recipe, validatedData);
        await em.flush();

        //TODO fix ValidationError: Value for Ingredient.id is required, 'undefined' found
        if (req.body.ingredientRecipes) {
            for (const ingredientRecipeData of req.body.ingredientRecipes) {
                const validatedData = await CreateIngredientRecipeSchema.validate(ingredientRecipeData).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                let isNewIngredientRecipe = true;
                for (const ingredientRecipe of recipe.ingredientRecipes.getItems()) {
                    if (ingredientRecipeData.ingredient.name == ingredientRecipe.ingredient.name) {
                        Object.assign(ingredientRecipe, ingredientRecipeData);
                        console.log(`Assigned ingredientRecipe ${ingredientRecipe}`)
                        isNewIngredientRecipe = false;
                    }
                }

                if (isNewIngredientRecipe) {
                    console.log(`It's new`)
                    ingredientRecipeData.recipe = recipe;
                    let existingIngredient = await em.getRepository(Ingredient).findOne({
                        name: ingredientRecipeData.ingredient.name,
                    });
                    if (!existingIngredient) {
                        const CreateIngredientDTO: CreateIngredientDTO = {
                            name: ingredientRecipeData.ingredient.name,
                            description: ingredientRecipeData.ingredient.description,
                            link: ingredientRecipeData.ingredient.link,
                        };
                        existingIngredient = new Ingredient(CreateIngredientDTO);
                    }

                    ingredientRecipeData.ingredient = existingIngredient;
                    recipe.ingredientRecipes.add(new IngredientRecipe(ingredientRecipeData));
                }
            }
        }

        if (req.body.recipeSteps) {
            for (const recipeStep of recipe.recipeSteps.getItems()) {
                em.remove(recipeStep);
            }
            recipe.recipeSteps.removeAll();

            for (const recipeStep of req.body.recipeSteps) {
                const validatedData = await CreateRecipeStepSchema.validate(recipeStep).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                recipeStep.recipe = recipe;
                recipe.recipeSteps.add(new RecipeStep(recipeStep));
            }
        }
        if (req.body.category) {
            if (recipe.category != null) em.remove(recipe.category)

            let category = req.body.category
            const validatedData = await CreateCategorySchema.validate(category).catch((e) => {
                res.status(400).json({errors: e.errors});
            });
            if (!validatedData) {
                return;
            }

            category.recipe = recipe;
            let existingCategory = await em.getRepository(Category).findOne({
                name: category.name,
            });
            if (!existingCategory) {
                const CreateCategoryDTO: CreateCategoryDTO = {
                    name: category.name,
                };
                existingCategory = new Category(CreateCategoryDTO);
            }

            category = existingCategory;
            recipe.category = category;

        }

        await em.persistAndFlush(recipe)
        res.status(200).send(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name', async (req, res) => {
    try {
        const em = DI.orm.em.fork();

        const existingRecipe = await em.getRepository(Recipe).find({
            name: req.params.name
        });
        if (!existingRecipe) {
            return res.status(403).json({errors: [`You can't delete this recipe`]});
        }

        const ingredientRecipesOfToBeRemovedRecipe = await em.getRepository(IngredientRecipe).find({
            recipe: existingRecipe,
        });
        for (const ingredientRecipe of ingredientRecipesOfToBeRemovedRecipe) {
            em.remove(ingredientRecipe);
        }

        const recipeSteps = await em.getRepository(RecipeStep).find({
            recipe: existingRecipe,
        });
        for (const recipeStep of recipeSteps) {
            em.remove(recipeStep);
        }

        const recipesImages = await em.getRepository(RecipeImage).find({
            recipe: existingRecipe,
        });
        for (const recipeImage of recipesImages){
            em.remove(recipeImage)
        }

        await em.remove(existingRecipe).flush();
        res.status(200).send({message: `Recipe ${req.params.name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name/ingredients', async (req, res) => {
    const {name} = req.params;

    try {
        const em = DI.orm.em.fork();
        const recipe = await em.getRepository(Recipe).findOne(
            {name: name},
            {populate: ['ingredientRecipes']}
        );

        if (!recipe) {
            return res.status(404).send({error: 'Recipe is not found'});
        }

        if (!req.body.ingredientNames || !Array.isArray(req.body.ingredientNames)) {
            return res.status(400).send({error: 'An array of at least one ingredient name must be in the request body'});
        }

        for (const ingredientName of req.body.ingredientNames) {
            const ingredientRecipe = recipe.ingredientRecipes.getItems().find(
                (ir) => ir.ingredient.name === ingredientName
            );

            if (ingredientRecipe) {
                em.remove(ingredientRecipe);
            } else {
                return res.status(404).send({error: `Recipe with ingredient name ${ingredientName} not found`});
            }
        }

        await em.persistAndFlush(recipe);
        res.status(200).send({message: `Ingredients from Recipe ${name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name/categories', async (req, res) => {
    try {
        const {name} = req.params;
        const em = DI.orm.em.fork();
        const recipe = await em.getRepository(Recipe).findOne(
            {name: name},
            {populate: ['category']}
        );

        if (!recipe) {
            return res.status(404).send({error: 'Recipe not found'});
        }

        /*if (!req.body.categories || !Array.isArray(req.body.categories)) {
            return res.status(400).send({error: 'An array of at least one category name must be in the request body'});
        }*/
        const category = recipe.category;
        if (category) {
            em.remove(category);
        } else {
            return res.status(404).send({error: `Category of recipe ${recipe.name} not found`});
        }
        await em.persistAndFlush(recipe);
        res.status(200).send({message: `Category from Recipe ${name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name/recipeImages', async (req, res) => {
    try {
        const {name} = req.params;
        const em = DI.orm.em.fork();
        const recipe = await em.getRepository(Recipe).findOne(
            {name: name},
            {populate: ['category']}
        );

        if (!recipe) {
            return res.status(404).send({error: 'Recipe not found'});
        }

        const recipeImages = recipe.recipeImages;
        if (recipeImages) {
            for (const recipeImage of recipeImages){
                em.remove(recipeImage)
            }
        } else {
            return res.status(404).send({error: `Category of recipe ${recipe.name} not found`});
        }
        await em.persistAndFlush(recipe);
        res.status(200).send({message: `Category from Recipe ${name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name/recipeImages/:imageName', async (req, res) => {
    try {
        const {name, imageName} = req.params;
        const em = DI.orm.em.fork();
        const recipe = await em.getRepository(Recipe).findOne(
            {name: name},
            {populate: ['category']}
        );

        if (!recipe) {
            return res.status(404).send({error: 'Recipe not found'});
        }

        const recipeImages = recipe.recipeImages;
        if (recipeImages) {
            for (const recipeImage of recipeImages){
                if (recipeImage.imageName === imageName) em.remove(recipeImage)
            }
        } else {
            return res.status(404).send({error: `Category of recipe ${recipe.name} not found`});
        }
        await em.persistAndFlush(recipe);
        res.status(200).send({message: `Category from Recipe ${name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const RecipeController = router;