import { Router } from 'express';
import { DI } from '../';
import { CreateIngredientSchema, Ingredient } from '../entities/Ingredient';
import { CreateIngredientDTO } from '../entities/Ingredient';
import { IngredientRecipe } from '../entities/IngredientRecipe';

const router = Router({ mergeParams: true });

router.get('/ingredient/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const ingredient = await DI.ingredientRepository.findOne({
            name: name,
        });

        if (!ingredient) {
            return res.status(404).send({ error: 'ingredient not found' });
        }

        res.status(200).send(ingredient);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.get('/all', async (req, res) => {
    try {
        const em = DI.em.fork();
        const { query } = req.query;
        console.log(query);
        let ingredients;

        if (query) {
            // If search query is provided, fetch matching ingredients
            ingredients = await em.getRepository(Ingredient).find(
                { name: { $like: `%${query}%` } },
                { populate: ['ingredientRecipes'] }
            );
            console.log(ingredients);
        } else {
            // If no search query, fetch all ingredients
            ingredients = await em.getRepository(Ingredient).findAll({ populate: ['ingredientRecipes'] });
        }

        if (!ingredients) {
            return res.status(400).send({ errors: ['No ingredients found in the database'] });
        }

        res.status(200).send(ingredients);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.post('/ingredient', async (req, res) => {
    try {
        const validatedData = await CreateIngredientSchema.validate(req.body).catch((e) => {
            res.status(400).send({ errors: e.errors });
        });

        if (!validatedData) {
            return;
        }

        const CreateIngredientDTO: CreateIngredientDTO = {
            ...validatedData,
        };

        const existingIngredient = await DI.em.getRepository(Ingredient).findOne({
            name: validatedData.name,
        });

        if (existingIngredient) {
            return res.status(400).send({ errors: ['Ingredient already exists'] });
        }

        const newIngredient = new Ingredient(CreateIngredientDTO);
        await DI.em.persistAndFlush(newIngredient);

        return res.status(201).send(newIngredient);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.put('/ingredient/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const validatedData = await CreateIngredientSchema.validate(req.body, {
            stripUnknown: true,
        }).catch((e) => {
            res.status(400).json({ errors: e.errors });
        });
        if (!validatedData) {
            return;
        }

        const em = DI.orm.em.fork();
        const ingredient = await em.getRepository(Ingredient).findOne({
            name: name,
        });

        if (!ingredient) {
            return res.status(404).send({ error: 'Ingredient is not found' });
        }

        Object.assign(ingredient, validatedData);

        await em.persistAndFlush(ingredient);

        res.status(200).send(ingredient);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.delete('/ingredient/:name', async (req, res) => {
    try {
        const em = DI.orm.em.fork();
        const existingIngredient = await em.getRepository(Ingredient).findOne({
            name: req.params.name,
        });
        if (!existingIngredient) {
            return res.status(404).json({ errors: [`Ingredient not found`] });
        }

        const recipesWithIngredients = await em.getRepository(IngredientRecipe).find({
            ingredient: { name: req.params.name },
        });
        for (const ingredientRecipe of recipesWithIngredients) {
            em.remove(ingredientRecipe);
        }

        await em.remove(existingIngredient).flush();
        return res.status(204).send({});
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const IngredientController = router;
