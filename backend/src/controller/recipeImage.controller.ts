import { Router } from 'express';

import { DI } from '../';
import {RecipeImage} from "../entities/RecipeImage";

const router = Router({ mergeParams: true });

router.get('/:recipe', async (req, res) => {
    const { recipe } = req.params;

    try {
        const em = DI.em.fork();
        const recipeImages = await em.getRepository(RecipeImage).find({
            recipe: {name: recipe},
        });
        if (recipeImages.length == 0) {
            return res.status(404).send({errors: ['Recipe is not found']});
        }

        res.status(200).send(recipeImages);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const RecipeImageController = router;