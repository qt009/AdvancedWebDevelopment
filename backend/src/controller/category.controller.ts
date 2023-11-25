import { Router } from 'express';

import { DI } from '../';
import {Category, CreateCategoryDTO, CreateCategorySchema} from "../entities/Category";

const router = Router({ mergeParams: true });


router.get('/:name', async (req, res) => {
    const { name } = req.params;
    try {

        const category = await DI.categoryRepository.findOne({
            name: name
        });

        if (!category) {
            return res.status(400).send({errors: ['Category not found']});
        }

        res.status(200).send(category);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.post('/', async (req, res) => {
    try {
        const validatedData = await CreateCategorySchema.validate(req.body).catch((e) => {
            res.status(400).send({errors: e.errors});
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
            return res.status(400).send({errors: ['Category already exists']});
        }

        const newCategory = new Category(CreateCategoryDTO);
        await DI.em.persistAndFlush(newCategory);

        return res.status(201).send(newCategory);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Put category by name
 */
router.put('/:name', async (req, res) => {
    const {name} = req.params;

    try {
        const validatedData = await CreateCategorySchema.validate(req.body).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }

        const em = DI.orm.em.fork();
        const category = await em.getRepository(Category).findOne({
            name: name,
        });

        if (!category) {
            return res.status(404).send({error: 'Category is not found'});
        }

        Object.assign(category, validatedData);

        await em.persistAndFlush(category);

        res.status(200).send(category);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name', async (req, res) => {
    const em = DI.orm.em.fork();

    try {
        const existingCategory = await em.getRepository(Category).find({
            name: req.params.name
        });
        if (!existingCategory) {
            return res.status(403).json({errors: [`You can't delete this category`]});
        }
        await em.remove(existingCategory).flush();
        return res.status(204).send({});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const CategoryController = router;