# Backend


## Description

---

The backend is a REST API that was implemented with Node.js and Express.js.
The application can be used to create, display, edit and delete recipes, ingredients, categories.

---
## Set up
Use the following steps in order to run backend correctly.

1. Install all neccessary packages and dependencies via Package Manager npm in backend.
```
cd /backend
npm install
```
2. The Port for our server is 3000. So its URL is `localhost:3000`.
3. Use`npm run schema:fresh` command line to create data base tables.
4. Add Database in IDE: Choose PostgreSQL (Port: 5432), then login with User as 'recipeDBUser', password as 'recipeWS23'.
5. Use `npm run start:dev` command line to run backend.
6. Test functionalities of Backend with Postman Collection Backend.postman_collection.json inside backend directory


---
## Entities

---
### Recipe Entity
This entity has all the characteristic of a recipe. 
It also has three arrays which can give out information about the recipe steps, categories and ingredients of the recipe.

```typescript
import {Category} from "./Category";

name: string;
description: string;
rating: number;
category: Category
ingredientRecipes: array <IngredientRecipes>
images: array <RecipeImage>
recipeSteps: array <RecipeStep>
```
### Ingredient Entity
The Ingredient entity consists of the following attributes:
```typescript
name: string;
description: string;
link: number;
```

### Category Entity
The Category entity consists of the following attributes:
```typescript
name: string;
```

### IngredientRecipe Entity
To represent the relationship between the recipe and the ingredient, the entity IngredientRecipe is used.

```typescript
// IngredientRecipeEntity.ts
amount: number;
unit: string;
ingredient: Ingredient;
recipe: Recipe;
```



### RecipeStep Entity
Category exists in the form of a 'one-to-many' relationship with the recipe.
RecipeStep entity stores the number of the recipe step and its description.

```typescript
stepName: string;
stepDescription: string;
recipe: Recipe;
```
---

## API


The API is accessible at `localhost:3000/`.

The following endpoints are available:

> **Notice**
>
> All uncatched errors are returned with a status code `500 Internal Server Error`.
> 
> The validation error with response code 400 is caused by the missing of a required field.

---


---

## APIs
  All controllers are in the folder `backend/src/controller`.
  Use http://localhost:3000/ as base URL for all requests.
  All requests are
- http://localhost:3000/recipes/category/:name
- ...
