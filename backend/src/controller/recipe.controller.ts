import {Router} from 'express';

import {wrap} from '@mikro-orm/core';

import {DI} from '../';
import {CreateRecipeSchema, CreateRecipeDTO, Recipe} from "../entities/Recipe";
import {CreateIngredientRecipeSchema, IngredientRecipe} from "../entities/IngredientRecipe";
import {CreateIngredientDTO, Ingredient} from "../entities/Ingredient";
import {Category, CreateCategorySchema, CreateCategoryDTO} from "../entities/Category";
import {CreateRecipeStepSchema, RecipeStep} from "../entities/RecipeStep";

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
 * New Feature
 * Get recipes with ratings greater than and equal to parameter
 */
router.get('/recipes/:rating', async (req, res) => {
    const {rating} = req.params;

    try {
        const em = DI.em.fork();
        const recipes = await em.getRepository(Recipe).find(
            {rating: {$lte: parseFloat(rating)}}
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

        if (CreateRecipeDTO.ingredientRecipes) {
            console.log(newRecipe.ingredientRecipes.length)
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
                        description: "",
                        link: "",
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

/**
 * Put recipe by name
 */
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

        if (req.body.ingredientRecipes) {
            for (const ingredientRecipeData of req.body.ingredientRecipes) {
                const validatedData = await CreateIngredientRecipeSchema.validate(ingredientRecipeData).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                let IsNew = true;
                for (const ingredientRecipe of recipe.ingredientRecipes.getItems()) {
                    if (ingredientRecipeData.ingredient.name == ingredientRecipe.ingredient.name) {
                        Object.assign(ingredientRecipe, ingredientRecipeData);
                        IsNew = false;
                    }
                }

                if (IsNew) {
                    ingredientRecipeData.recipe = recipe;
                    let existingIngredient = await em.getRepository(Ingredient).findOne({
                        name: ingredientRecipeData.ingredient.name,
                    });
                    if (!existingIngredient) {
                        const CreateIngredientDTO: CreateIngredientDTO = {
                            name: ingredientRecipeData.ingredient.name,
                            description: "",
                            link: "",
                        };
                        existingIngredient = new Ingredient(CreateIngredientDTO);
                    }

                    ingredientRecipeData.ingredient = existingIngredient;
                    recipe.ingredientRecipes.add(new IngredientRecipe(ingredientRecipeData));
                }
            }
        }

        if (req.body.recipeSteps) {
            for (const recipStep of recipe.recipeSteps.getItems()) {
                em.remove(recipStep);
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

/**
 * Delete recipe by name
 */
router.delete('/:name', async (req, res) => {
    try {
        const em = DI.orm.em.fork();

        const existingRecipe = await em.getRepository(Recipe).find({
            name: req.params.name
        });
        if (!existingRecipe) {
            return res.status(403).json({errors: [`You can't delete this recipe`]});
        }

        const recipesWithIngredients = await em.getRepository(IngredientRecipe).find({
            recipe: {name: req.params.name},
        });
        for (const ingredientRecipe of recipesWithIngredients) {
            em.remove(ingredientRecipe);
        }

        const recipesWithSteps = await em.getRepository(RecipeStep).find({
            recipe: {name: req.params.name},
        });
        for (const recipeStep of recipesWithSteps) {
            em.remove(recipeStep);
        }

        await em.remove(existingRecipe).flush();
        res.status(200).send({message: `Recipe ${req.params.name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Delete ingredients of recipe by recipe's name
 */
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
            return res.status(400).send({error: 'Invalid or missing ingredient names in the request body'});
        }

        // Find and remove the IngredientRecipes by name
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

/**
 * Delete categories of recipe by recipe's name
 */
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

        if (!req.body.categories || !Array.isArray(req.body.categories)) {
            return res.status(400).send({error: 'Invalid or missing category names in the request body'});
        }

        let category = req.body.category;
        if (category) {
            em.remove(category);
        } else {
            return res.status(404).send({error: `Recipe with tag ${category} not found`});
        }


        await em.persistAndFlush(recipe);

        res.status(200).send({message: `Tags from Recipe ${name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const RecipeController = router;