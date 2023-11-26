import { Router } from 'express';

import { DI } from '../';
import { Category, CreateCategoryDTO, CreateCategorySchema } from "../entities/Category";

const router = Router({ mergeParams: true });

router.get('/category/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const category = await DI.categoryRepository.findOne({
            name: name
        });

        if (!category) {
            return res.status(404).send({ error: 'Category not found' });
        }

        res.status(200).send(category);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});
router.get('/all', async (req, res) => {
    try {
        const em = DI.em.fork();
        const {query} = req.query;
        console.log(query)
        let categories;

        if (query) {
            // If search query is provided, fetch matching recipes
            categories = await em.getRepository(Category).find(
                {name: {$like: `%${query}%`}},
                {populate: ['recipes']},
            )
            console.log(categories)
        } else {
            // If no search query, fetch all recipes
            categories = await em.getRepository(Category).findAll(
                {populate: ['recipes']},
            );
        }

        if (!categories) {
            return res.status(400).send({errors: ['No categories found in the database']});
        }

        res.status(200).send(categories);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.post('/category', async (req, res) => {
    try {
        const validatedData = await CreateCategorySchema.validate(req.body).catch((e) => {
            res.status(400).send({ errors: e.errors });
        });

        if (!validatedData) {
            return;
        }

        const CreateCategoryDTO: CreateCategoryDTO = {
            ...validatedData,
        }

        const existingCategory = await DI.categoryRepository.findOne({
            name: validatedData.name,
        });

        if (existingCategory) {
            return res.status(400).send({ errors: ['Category already exists'] });
        }

        const newCategory = new Category(CreateCategoryDTO);
        await DI.em.persistAndFlush(newCategory);

        return res.status(201).send(newCategory);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.put('/category/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const validatedData = await CreateCategorySchema.validate(req.body).catch((e) => {
            res.status(400).json({ errors: e.errors });
        });
        if (!validatedData) {
            return;
        }

        const em = DI.orm.em.fork();
        const category = await em.getRepository(Category).findOne({
            name: name,
        });

        if (!category) {
            return res.status(404).send({ error: 'Category is not found' });
        }

        Object.assign(category, validatedData);

        await em.persistAndFlush(category);

        res.status(200).send(category);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.delete('/category/:name', async (req, res) => {
    const em = DI.orm.em.fork();

    try {
        const existingCategory = await em.getRepository(Category).findOne({
            name: req.params.name
        });
        if (!existingCategory) {
            return res.status(404).json({ error: `Category not found` });
        }
        await em.remove(existingCategory).flush();
        return res.status(204).send({});
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const CategoryController = router;
