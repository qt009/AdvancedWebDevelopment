import { Router } from 'express';

import { wrap } from '@mikro-orm/core';

import { DI } from '../';
import {RecipeStep} from "../entities/RecipeStep";

const router = Router({ mergeParams: true });

router.get('/:recipe', async (req, res) => {
    const { recipe } = req.params;

    try {
        const em = DI.em.fork();
        const recipeSteps = await em.getRepository(RecipeStep).find({
            recipe: {name: recipe},
        });
        if (recipeSteps.length == 0) {
            return res.status(404).send({errors: ['Recipe is not found']});
        }

        res.status(200).send(recipeSteps);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});
export const RecipeStepController = router;