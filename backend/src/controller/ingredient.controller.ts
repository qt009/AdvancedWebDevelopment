import { Router } from 'express';

import { wrap } from '@mikro-orm/core';

import { DI } from '../';
import {CreateIngredientSchema, Ingredient} from "../entities/Ingredient";

const router = Router({ mergeParams: true });
import{CreateIngredientDTO} from "../entities/Ingredient";
import {IngredientRecipe} from "../entities/IngredientRecipe";

router.get('/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const em = DI.em.fork();

        const ingredient = await em.getRepository(Ingredient).findOne({
            name: name
        });

        if (!ingredient) {
            return res.status(400).send({errors: ['Ingredient doesnt exists']});
        }

        res.status(200).send(ingredient);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.post('/', async (req, res) => {
    try {
        const validatedData = await CreateIngredientSchema.validate(req.body).catch((e) => {
            res.status(400).send({errors: e.errors});
        });

        if (!validatedData) {
            return;
        }

        const CreateIngredientDTO: CreateIngredientDTO = {
            ...validatedData,
        }

        const em = DI.em.fork();

        const existingIngredient = await em.getRepository(Ingredient).findOne({
            name: validatedData.name,
        });

        if (existingIngredient) {
            return res.status(400).send({errors: ['Ingredient already exists']});
        }

        const newIngredient = new Ingredient(CreateIngredientDTO);
        await em.persistAndFlush(newIngredient);

        return res.status(201).send(newIngredient);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.put('/:name', async (req, res) => {
    const {name} = req.params;

    try {
        const validatedData = await CreateIngredientSchema.validate(req.body,
            {stripUnknown: true,}
        ).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }

        const em = DI.orm.em.fork();
        const ingredient = await em.getRepository(Ingredient).findOne({
            name: name,
        });

        if (!ingredient) {
            return res.status(404).send({error: 'Ingredient is not found'});
        }

        Object.assign(ingredient, validatedData);

        await em.persistAndFlush(ingredient);

        res.status(200).send(ingredient);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Delete ingredient by name
 */
router.delete('/:name', async (req, res) => {
    try {
        const em = DI.orm.em.fork();
        const existingIngredient = await em.getRepository(Ingredient).find({
            name: req.params.name
        });
        if (!existingIngredient) {
            return res.status(403).json({errors: [`You can't delete this ingredient`]});
        }

        const recipesWithIngredients = await em.getRepository(IngredientRecipe).find({
            ingredient: {name: req.params.name},
        });
        for (const ingredientRecipe of recipesWithIngredients) {
            em.remove(ingredientRecipe);
        }

        await em.remove(existingIngredient).flush();
        return res.status(204).send({});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});
export const IngredientController = router;