'use strict';

import {BaseLayout} from "../layout/BaseLayout.tsx";
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
} from "@chakra-ui/react";
import {useState, useEffect} from "react";

// ... (your existing imports)

export const CategoryPage = () => {
    const initialState = {
        id: "",
        name: "",
    };

    const [categories, setCategories] = useState([initialState]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedCategory, setEditedCategory] = useState(initialState);
    const [editMode, setEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch categories from your API based on the search query
        const apiUrl = searchQuery
            ? `http://localhost:3000/categories/all?query=${searchQuery}`
            : 'http://localhost:3000/categories/all';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch(error => console.error('Error fetching categories:', error));
        console.log("categories: ", categories)
    }, [searchQuery]);

    // Function to open the modal for adding a new category
    const openAddCategoryForm = () => {
        setSelectedCategory(null); // Clear selected category
        setEditedCategory(initialState);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const openCategoryForm = (category: any) => {
        setSelectedCategory(category);
        setEditedCategory(category);
        setIsModalOpen(true);
    };

    const closeCategoryForm = () => {
        setSelectedCategory(null);
        setIsModalOpen(false);
    };

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        console.log("name & value: ", name, value)
        setEditedCategory((prevState) => ({ ...prevState, [name]: value }))
    };

    const handleDeleteCategory = (categoryName: string) => {
        // Make a DELETE request to delete the category with the specified id
        fetch(`http://localhost:3000/categories/category/${categoryName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // Optionally, you can update the state to reflect the changes after deletion
                setCategories(prevCategories => prevCategories.filter(category => category.id !== categoryName));
            })
            .catch(error => console.error('Error:', error));
    };

    const submitCategoryForm = () => {
        if (selectedCategory) {
            console.log("Submitting form with updated data:", editedCategory);

            // @ts-ignore
            fetch(`http://localhost:3000/categories/category/${selectedCategory.name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedCategory),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            closeCategoryForm();
        } else {
            console.log("Submitting form with new data:", editedCategory);

            fetch('http://localhost:3000/categories/category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedCategory),
            })
                .then(response => response.json())
                .then(data => {
                    setCategories(prevCategories => [...prevCategories, data]);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            closeCategoryForm();
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
            {/* Button to add a new category */}
            <Button colorScheme="teal" mt={4} onClick={openAddCategoryForm}>
                Add New Category
            </Button>

            <SimpleGrid columns={[1, 2, 3]} spacing={8} p={8}>
                {/* Category Cards (Replace with your data) */}
                {categories?.map((category) => (
                    <Box
                        key={category.id}
                        p={4}
                        border="1px"
                        borderColor="gray.300"
                        borderRadius="md"
                        transition="all 0.3s"
                        backgroundColor={"gray.50"}
                        onClick={() => openCategoryForm(category)}
                        _groupHover={{
                            boxShadow: "lg",
                            borderColor: "teal.400",
                            backgroundColor: "yellow",
                        }}
                        cursor="pointer"
                    >
                        <Text fontSize="xl" fontWeight="bold" mb={2}>
                            {category.name}
                        </Text>
                        <Button colorScheme="teal" mt={2}>
                            View
                        </Button>
                        <Button colorScheme="red" mt={2} ml={4} onClick={(e) => {
                            e.stopPropagation(); // Prevent the card click event from triggering
                            handleDeleteCategory(category.name);
                        }}>
                            Delete
                        </Button>
                    </Box>
                ))}
            </SimpleGrid>

            {/* Modal for Category Form */}
            <Modal isOpen={isModalOpen} onClose={closeCategoryForm}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedCategory ? 'View Category' : 'Add New Category'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editedCategory && (
                            <>
                                <FormLabel fontSize="xl" fontWeight="bold" mb={2}>
                                    Name
                                </FormLabel>
                                <Input
                                    name="name"
                                    placeholder="Name"
                                    mb={4}
                                    value={editedCategory.name}
                                    onChange={handleInputChange}
                                    isReadOnly={!editMode}
                                />


                                {/* Edit Toggle Switch */}
                                <Switch isChecked={editMode} onChange={toggleEditMode} colorScheme="teal" mt={4}>
                                    Edit Mode
                                </Switch>

                                {/* Save Button */}
                                <div>
                                    <br />
                                </div>
                                {editMode && (
                                    <Button colorScheme="teal" mt={4} onClick={submitCategoryForm}>
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
