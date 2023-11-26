'use strict';

import {BaseLayout} from "../layout/BaseLayout.tsx";
import {DeleteIcon} from '@chakra-ui/icons';
import {
    SimpleGrid,
    Box,
    Text,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Input,
    FormLabel,
    Switch,
    IconButton, Icon, Image
} from "@chakra-ui/react";
import {useState, useEffect} from "react";


export const RecipePage = () => {
    const initialState = {
        id: "",
        name: "", description: "", rating: 0,
        category: {name: ""},
        ingredientRecipes: [{amount: 0, unit: "", ingredient: {name: "", description: "", link: ""}}],
        recipeImages: [{imageName: "", imageUrl: ""}],
        recipeSteps: [{stepName: "", stepDescription: ""}]
    }

    const [recipes, setRecipes] = useState(Array(initialState));
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedRecipe, setEditedRecipe] = useState(
        initialState)
    const [editMode, setEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch recipes from your API based on the search query
        const apiUrl = searchQuery
            ? `http://localhost:3000/recipes/all?query=${searchQuery}`
            : 'http://localhost:3000/recipes/all';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => setRecipes(data))
            .catch(error => console.error('Error fetching recipes:', error));
    }, [searchQuery]);
    // Function to open the modal for adding a new recipe
    const openAddRecipeForm = () => {
        setSelectedRecipe(null); // Clear selected recipe
        setEditedRecipe(initialState);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const openRecipeForm = (recipe: any) => {
        console.log("Opening form for recipe:", recipe);

        fetch(`http://localhost:3000/recipes/recipe/${recipe.name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                setSelectedRecipe(data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        setEditedRecipe({
            id: recipe.id,
            name: recipe.name, description: recipe.description, rating: recipe.rating,
            category: { name: recipe.category.name}, ingredientRecipes: [{ amount: 0, unit: "", ingredient: { name: "", description: "", link: "" } }], recipeImages: recipe.recipeImages, recipeSteps: recipe.recipeSteps
        });
        setIsModalOpen(true);
    };

    const closeRecipeForm = () => {
        setSelectedRecipe(null);
        setIsModalOpen(false);
    };

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
        const {name, value} = e.target;

        if (name.startsWith("category")) {
            setEditedRecipe((prevState) => ({
                ...prevState,
                category: {...prevState.category, ["name"]: value},
            }));
        } else if (name.startsWith("ingredientRecipes")) {
            const index = name.match(/\d+/)[0];

            if (name.endsWith("ingredient.name")) {
                const property = "ingredient";
                const subProperty = "name";
                console.log("index and ingredient.name:", index, property);
                setEditedRecipe((prevState) => ({
                    ...prevState,
                    ingredientRecipes: prevState.ingredientRecipes?.map((ingredientRecipe, i) =>
                        i === Number(index)
                            ? {
                                ...ingredientRecipe,
                                [property]: {
                                    ...ingredientRecipe[property],
                                    [subProperty]: value,
                                },
                            }
                            : ingredientRecipe
                    ),
                }));

                console.log("ingredient:", editedRecipe.ingredientRecipes[index].ingredient.name)
            } else if (name.endsWith("amount")) {
                const amount = "amount";
                console.log("index and amount:", index, amount);
                setEditedRecipe((prevState) => ({
                    ...prevState,
                    ingredientRecipes: prevState.ingredientRecipes?.map((ingredientRecipe, i) =>
                        i === Number(index)
                            ? {...ingredientRecipe, [amount]: value}
                            : ingredientRecipe
                    ),
                }));
            } else if (name.endsWith("unit")) {
                const unit = "unit";
                console.log("index and unit:", index, unit);
                setEditedRecipe((prevState) => ({
                    ...prevState,
                    ingredientRecipes: prevState.ingredientRecipes?.map((ingredientRecipe, i) =>
                        i === Number(index)
                            ? {...ingredientRecipe, [unit]: value}
                            : ingredientRecipe
                    ),
                }));
            }
        } else if (name.startsWith("recipeImages")) {
            const index = name.match(/\d+/)[0];
            if (name.endsWith("imageName")) {
                const property = "imageName";
                console.log("index and imageName:", index, property);
                setEditedRecipe((prevState) => ({
                    ...prevState,
                    recipeImages: prevState.recipeImages?.map((image, i) =>
                        i === Number(index)
                            ? {...image, [property]: value}
                            : image
                    ),
                }));
            }
            if (name.endsWith("imageUrl")) {
                const property = "imageUrl";
                console.log("index and imageUrl:", index, property);
                setEditedRecipe((prevState) => ({
                    ...prevState,
                    recipeImages: prevState.recipeImages?.map((image, i) =>
                        i === Number(index)
                            ? {...image, [property]: value}
                            : image
                    ),
                }));
            }

        } else if (name.startsWith("recipeSteps")) {
            const index = name.match(/\d+/)[0];
            if (name.endsWith("stepName")) {
                const property = "stepName";
                console.log("index and stepName:", index, property);
                setEditedRecipe((prevState) => ({
                    ...prevState,
                    recipeSteps: prevState.recipeSteps?.map((step, i) =>
                        i === Number(index)
                            ? {...step, [property]: value}
                            : step
                    ),
                }));
            } else if (name.endsWith("stepDescription")) {
                const property = "stepDescription";
                console.log("index and stepDescription:", index, property);
                setEditedRecipe((prevState) => ({
                    ...prevState,
                    recipeSteps: prevState.recipeSteps?.map((step, i) =>
                        i === Number(index)
                            ? {...step, [property]: value}
                            : step
                    ),
                }));
            }
        } else {
            setEditedRecipe((prevState) => ({...prevState, [name]: value}));
        }
    };


    const handleRemoveIngredient = (indexToRemove: number) => {
        setEditedRecipe((prevState) => ({
            ...prevState,
            ingredientRecipes: prevState.ingredientRecipes
                ? prevState.ingredientRecipes.filter((_, index) => index !== indexToRemove)
                : [],
        }));
    };

    const handleAddNewIngredient = () => {
        setEditedRecipe((prevState) => ({
            ...prevState,
            ingredientRecipes: [
                ...(prevState.ingredientRecipes || []),
                { ingredient: { name: "", description: "", link: "" }, amount: 0, unit: "" },
            ],
        }));
    };

// Inside your RecipePage component
    const handleAddNewImage = () => {
        setEditedRecipe((prevState) => ({
            ...prevState,
            recipeImages: [...(prevState.recipeImages || []), { imageName: '', imageUrl: '' }],
        }));
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setEditedRecipe((prevState) => ({
            ...prevState,
            recipeImages: prevState.recipeImages
                ? prevState.recipeImages.filter((_, index) => index !== indexToRemove)
                : [],
        }));
    };

    const handleAddNewStep = () => {
        setEditedRecipe((prevState) => ({
            ...prevState,
            recipeSteps: [...(prevState.recipeSteps || []), { stepName: '', stepDescription: '' }],
        }));
    };

    const handleRemoveStep = (indexToRemove: number) => {
        setEditedRecipe((prevState) => ({
            ...prevState,
            recipeSteps: prevState.recipeSteps
                ? prevState.recipeSteps.filter((_, index) => index !== indexToRemove)
                : [],
        }));
    };
    const handleDeleteRecipe = (recipeName: string) => {
        // Make a DELETE request to delete the recipe with the specified name
        fetch(`http://localhost:3000/recipes/recipe/${recipeName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // Optionally, you can update the state to reflect the changes after deletion
                setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.name !== recipeName));
            })
            .catch(error => console.error('Error:', error));
    };



    const submitRecipeForm = () => {

        if(selectedRecipe){
            console.log("Submitting form with updated data:", selectedRecipe);

            // @ts-ignore
            fetch(`http://localhost:3000/recipes/recipe/${selectedRecipe.name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedRecipe),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            closeRecipeForm();
        }
        else {
            console.log("Submitting form with new data:", editedRecipe);

            // @ts-ignore
            fetch('http://localhost:3000/recipes/recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedRecipe),
            })
                .then(response => response.json())
                .then(data => {
                    setSelectedRecipe(data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            closeRecipeForm();
        }

    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    return (
        <BaseLayout>
            <Input
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                mb={4}
            />
            {/* Button to add a new recipe */}
            <Button colorScheme="teal" mt={4} onClick={openAddRecipeForm}>
                Add New Recipe
            </Button>

            <SimpleGrid columns={[1, 2, 3]} spacing={8} p={8}>
                {/* Featured Recipe Cards (Replace with your data) */}
                {recipes?.map((recipe: any) => (
                    <Box
                        key={recipe.id}
                        p={4}
                        border="1px"
                        borderColor="gray.300"
                        borderRadius="md"
                        transition="all 0.3s"
                        backgroundColor={"gray.50"}
                        onClick={() => openRecipeForm(recipe)}
                        _groupHover={{
                            boxShadow: "lg",
                            borderColor: "teal.400",
                            backgroundColor: "yellow",
                        }}
                        cursor="pointer"
                    >
                        <Text fontSize="xl" fontWeight="bold" mb={2}>
                            {recipe.name}
                        </Text>
                        <Text>{recipe.description}</Text>
                        <Text>Rating: {recipe.rating}</Text>
                        <Image src={recipe.link}></Image>
                        <Button colorScheme="teal" mt={2}>
                            View
                        </Button>
                        <Button colorScheme="red" mt={2} ml={4} onClick={(e) => {
                            e.stopPropagation(); // Prevent the card click event from triggering
                            handleDeleteRecipe(recipe.name);
                        }}>
                            Delete
                        </Button>
                    </Box>
                ))}
            </SimpleGrid>

            {/* Modal for Recipe Form */}
            <Modal isOpen={isModalOpen} onClose={closeRecipeForm}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>{selectedRecipe ? 'View Recipe' : 'Add New Recipe'}</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        {editedRecipe && (
                            <>
                                {/* Basic Recipe Info */}
                                <FormLabel fontSize="xl" fontWeight="bold" mb={2}>
                                    Name
                                </FormLabel>
                                <Input
                                    name="name"
                                    placeholder="Name"
                                    mb={4}
                                    value={editedRecipe.name}
                                    onChange={handleInputChange}
                                    isReadOnly={!editMode}
                                />
                                <FormLabel fontSize="xl" fontWeight="bold" mb={2}>
                                    Description
                                </FormLabel>
                                <Input
                                    name="description"
                                    placeholder="Description"
                                    mb={4}
                                    value={editedRecipe.description}
                                    onChange={handleInputChange}
                                    isReadOnly={!editMode}
                                />
                                <FormLabel fontSize="xl" fontWeight="bold" mb={2}>
                                    Rating
                                </FormLabel>
                                <Input
                                    name="rating"
                                    type="number"
                                    placeholder="Rating"
                                    mb={4}
                                    value={editedRecipe.rating}
                                    onChange={handleInputChange}
                                    isReadOnly={!editMode}
                                />

                                {/* Category Section */}
                                <FormLabel fontSize="xl" fontWeight="bold" mb={2}>
                                    Category
                                </FormLabel>
                                <Input
                                    name="category.name"
                                    placeholder="Category"
                                    mb={4}
                                    value={editedRecipe.category.name}
                                    onChange={handleInputChange}
                                    isReadOnly={!editMode}
                                />


                                <Box mt={8}>
                                    <Text fontSize="xl" fontWeight="bold" mb={2}>
                                        Ingredients
                                    </Text>
                                    {editedRecipe.ingredientRecipes?.map((ingredientRecipe, index) => (
                                        <Box key={index} mb={2} display="flex" alignItems="center">
                                            <Text fontSize="lg" mb={2} mr={2} style={{textIndent: 20}}>
                                                #{index + 1}
                                            </Text>
                                            <Input
                                                name={`ingredientRecipes[${index}].ingredient.name`}
                                                placeholder="Ingredient Name"
                                                mr={2}
                                                value={ingredientRecipe.ingredient.name}
                                                onChange={handleInputChange}
                                                isReadOnly={!editMode}
                                            />
                                            <Input
                                                name={`ingredientRecipes[${index}].amount`}
                                                type="number"
                                                placeholder="Amount"
                                                mr={2}
                                                value={ingredientRecipe.amount}
                                                onChange={handleInputChange}
                                                isReadOnly={!editMode}
                                            />
                                            <Input
                                                name={`ingredientRecipes[${index}].unit`}
                                                placeholder="Unit"
                                                mr={2}
                                                value={ingredientRecipe.unit}
                                                onChange={handleInputChange}
                                                isReadOnly={!editMode}
                                            />
                                            {/* Add options to view and edit ingredient details */}
                                            {editMode && (
                                                <>
                                                    <IconButton
                                                        aria-label={"delete"}
                                                        icon={<DeleteIcon/>}
                                                        size="sm"
                                                        colorScheme="red"
                                                        onClick={() => handleRemoveIngredient(index)}
                                                    />
                                                </>
                                            )}
                                        </Box>
                                    ))}
                                    {editMode && (
                                        <Button size="sm" colorScheme="green" onClick={handleAddNewIngredient}>
                                            Add New Ingredient
                                        </Button>
                                    )}

                                </Box>
                                <Box mt={8}>
                                    <Text fontSize="xl" fontWeight="bold" mb={2}>
                                        Recipe Images
                                    </Text>
                                    {editedRecipe.recipeImages?.map((image, index) => (
                                        <Box key={index} mb={2} display="flex" alignItems="center">
                                            <Text fontSize="lg" mb={2} mr={2} style={{textIndent: 20}}>
                                                #{index + 1}
                                            </Text>
                                            <Input
                                                name={`recipeImages.${index}.imageName`}
                                                placeholder="Image Name"
                                                mr={2}
                                                value={image.imageName}
                                                onChange={handleInputChange}
                                                isReadOnly={!editMode}
                                            />
                                            <Input
                                                name={`recipeImages.${index}.imageUrl`}
                                                placeholder="Image URL"
                                                mr={2}
                                                value={image.imageUrl}
                                                onChange={handleInputChange}
                                                isReadOnly={!editMode}
                                            />
                                            {editMode && (
                                                <>

                                                    <IconButton
                                                        size="sm" colorScheme="red"
                                                        onClick={() => handleRemoveImage(index)}
                                                        aria-label={"delete"}
                                                        icon={<Icon as={DeleteIcon}/>}/>

                                                </>
                                            )}
                                        </Box>
                                    ))}
                                    {editMode && (
                                        <Button size="sm" colorScheme="green" onClick={handleAddNewImage}>
                                            Add New Image
                                        </Button>
                                    )}
                                </Box>
                                <Box mt={8}>

                                    {/* Recipe Steps Section */}
                                    <Text fontSize="xl" fontWeight="bold" mb={2}>
                                        Recipe Steps
                                    </Text>
                                    {editedRecipe.recipeSteps?.map((step, index) => (
                                        <Box key={index} mb={2} display="flex" alignItems="center">
                                            <Text fontSize="lg" mb={2} mr={2} style={{textIndent: 20}}>
                                                #{index + 1}
                                            </Text>
                                            <Input
                                                name={`recipeSteps.${index}.stepName`}
                                                placeholder="Step Name"
                                                mr={2}
                                                value={step.stepName}
                                                onChange={handleInputChange}
                                                isReadOnly={!editMode}
                                            />
                                            <Input
                                                name={`recipeSteps.${index}.stepDescription`}
                                                placeholder="Step Description"
                                                mr={2}
                                                value={step.stepDescription}
                                                onChange={handleInputChange}
                                                isReadOnly={!editMode}
                                            />
                                            {/* Add options to view and edit step details */}
                                            {editMode && (
                                                <>

                                                    <IconButton aria-label={"delete"}
                                                                size="sm" colorScheme="red"
                                                                onClick={() => handleRemoveStep(index)}
                                                                icon={<Icon as={DeleteIcon}/>}/>

                                                </>
                                            )}
                                        </Box>
                                    ))}
                                    {editMode && (
                                        <Button size="sm" colorScheme="green" onClick={handleAddNewStep}>
                                            Add New Step
                                        </Button>
                                    )}
                                </Box>

                                {/* Edit Toggle Switch */}
                                <Switch isChecked={editMode} onChange={toggleEditMode} colorScheme="teal" mt={4}>
                                    Edit Mode
                                </Switch>

                                {/* Save Button */}
                                <div>
                                    <br/>
                                </div>
                                {editMode && (
                                    <Button colorScheme="teal" mt={4} onClick={submitRecipeForm}>
                                        Save Changes
                                    </Button>
                                )}
                            </>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </BaseLayout>
    );
};
