import { Router } from 'express';

import { wrap } from '@mikro-orm/core';

import { DI } from '../';
import {IngredientRecipe} from "../entities/IngredientRecipe";
import {Recipe} from "../entities/Recipe";

const router = Router({ mergeParams: true });

router.get('/:ingredient', async (req, res) => {
    const { ingredient } = req.params;

    try {
        const em = DI.em.fork();
        const recipesWithIngredients = await em.getRepository(IngredientRecipe).find({
            ingredient: {name: ingredient},
        });
        if (recipesWithIngredients.length == 0) {
            return res.status(404).send({errors: ['Recipe is not found']});
        }

        res.status(200).send(recipesWithIngredients);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * New Feature
 * Get all recipes by one or more ingredients
 */
router.get('/', async (req, res) => {
    try {
        const em = DI.orm.em.fork();

        if (!req.body.ingredientList || !Array.isArray(req.body.ingredientList) || req.body.ingredientList.length === 0) {
            return res.status(400).json({error: 'Ingredients must be non-empty'});
        }

        const recipes = await em.find(Recipe, {
            $and: req.body.ingredientList.map((ingredient: string) => ({
                ingredientRecipes: {
                    ingredient: {
                        name: ingredient,
                    },
                },
            })),
        });

        if (recipes.length == 0) {
            return res.status(404).send({errors: ['Recipe is not found']});
        }

        res.status(200).send(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const IngredientRecipeController = router;