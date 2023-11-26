// Import statements for necessary dependencies and components
import { useState, useEffect } from 'react';
import { BaseLayout } from '../layout/BaseLayout';
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
} from '@chakra-ui/react';

export const IngredientPage = () => {
    const initialState = {
        id: '',
        name: '',
        description: '',
        link: '',
    };

    const [ingredients, setIngredients] = useState([initialState]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedIngredient, setEditedIngredient] = useState(initialState);
    const [editMode, setEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const apiUrl = searchQuery
            ? `http://localhost:3000/ingredients/all?query=${searchQuery}`
            : 'http://localhost:3000/ingredients/all';

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => setIngredients(data))
            .catch((error) => console.error('Error fetching ingredients:', error));
        console.log('data: ', ingredients);
    }, [searchQuery]);

    const openAddIngredientForm = () => {
        setSelectedIngredient(null);
        setEditedIngredient(initialState);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const openIngredientForm = (ingredient: any) => {
        setSelectedIngredient(ingredient);
        setEditedIngredient(ingredient);
        setIsModalOpen(true);
    };

    const closeIngredientForm = () => {
        setSelectedIngredient(null);
        setIsModalOpen(false);
    };

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setEditedIngredient((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleDeleteIngredient = (ingredientName: string) => {
        fetch(`http://localhost:3000/ingredients/ingredient/${ingredientName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
                setIngredients((prevIngredients) => prevIngredients.filter((ingredient) => ingredient.id !== ingredientName));
            })
            .catch((error) => console.error('Error:', error));
    };

    const submitIngredientForm = () => {
        console.log('editedIngredient: ', editedIngredient);
        console.log('selectedIngredient: ', selectedIngredient);
        if (selectedIngredient) {
            // @ts-ignore
            fetch(`http://localhost:3000/ingredients/ingredient/${selectedIngredient.name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedIngredient),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            closeIngredientForm();
        } else {
            fetch('http://localhost:3000/ingredients/ingredient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedIngredient),
            })
                .then((response) => response.json())
                .then((data) => {
                    setIngredients((prevIngredients) => [...prevIngredients, data]);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            closeIngredientForm();
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
            <Button colorScheme="teal" mt={4} onClick={openAddIngredientForm}>
                Add New Ingredient
            </Button>

            <SimpleGrid columns={[1, 2, 3]} spacing={8} p={8}>
                {ingredients?.map((ingredient) => (
                    <Box
                        key={ingredient.id}
                        p={4}
                        border="1px"
                        borderColor="gray.300"
                        borderRadius="md"
                        transition="all 0.3s"
                        backgroundColor={'gray.50'}
                        onClick={() => openIngredientForm(ingredient)}
                        _groupHover={{
                            boxShadow: 'lg',
                            borderColor: 'teal.400',
                            backgroundColor: 'yellow',
                        }}
                        cursor="pointer"
                    >
                        <Text fontSize="xl" fontWeight="bold" mb={2}>
                            {ingredient.name}
                        </Text>
                        <Text>{ingredient.description}</Text>
                        <Button colorScheme="teal" mt={2}>
                            View
                        </Button>
                        <Button
                            colorScheme="red"
                            mt={2}
                            ml={4}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteIngredient(ingredient.name);
                            }}
                        >
                            Delete
                        </Button>
                    </Box>
                ))}
            </SimpleGrid>

            <Modal isOpen={isModalOpen} onClose={closeIngredientForm}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedIngredient ? 'View Ingredient' : 'Add New Ingredient'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editedIngredient && (
                            <>
                                <FormLabel fontSize="xl" fontWeight="bold" mb={2}>
                                    Name
                                </FormLabel>
                                <Input
                                    name="name"
                                    placeholder="Name"
                                    mb={4}
                                    value={editedIngredient.name}
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
                                    value={editedIngredient.description}
                                    onChange={handleInputChange}
                                    isReadOnly={!editMode}
                                />
                                <FormLabel fontSize="xl" fontWeight="bold" mb={2}>
                                    Link
                                </FormLabel>
                                <Input
                                    name="link"
                                    placeholder="Link"
                                    mb={4}
                                    value={editedIngredient.link}
                                    onChange={handleInputChange}
                                    isReadOnly={!editMode}
                                />

                                <Switch isChecked={editMode} onChange={toggleEditMode} colorScheme="teal" mt={4}>
                                    Edit Mode
                                </Switch>

                                <div>
                                    <br />
                                </div>
                                {editMode && (
                                    <Button colorScheme="teal" mt={4} onClick={submitIngredientForm}>
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
