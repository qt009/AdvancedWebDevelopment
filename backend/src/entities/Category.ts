import {BaseEntity} from "./BaseEntity";
import {Collection, Entity, OneToMany, PrimaryKey, Property} from "@mikro-orm/core";
import {object, string} from "yup";
import {Recipe} from "./Recipe";

@Entity()
export class Category extends BaseEntity{
    @Property()
    name: string;

    @OneToMany(() => Recipe, (r) => r.category)
    recipes = new Collection<Recipe>(this);
    constructor({ name}: CreateCategoryDTO) {
        super()
        this.name = name;
    }
}

export const CreateCategorySchema = object({
    name: string().required()
});

export type CreateCategoryDTO = {
    name: string;
};