import { Link as RouterLink } from "react-router-dom";
import { BaseLayout } from "../layout/BaseLayout.tsx";
import { VStack, Text, Button, SimpleGrid, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const HomePage = () => {
    const [featuredRecipes, setFeaturedRecipes] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/recipes/featured/recipes')
            .then(response => response.json())
            .then(data => setFeaturedRecipes(data))
            .catch(error => console.error('Error fetching featured recipes:', error));
    }, []);

    return (
        <BaseLayout>
            <VStack spacing={8} align="center">
                <Text fontSize="2xl" fontWeight="bold">
                    Featured Recipes
                </Text>

                {/* Featured Recipe Cards */}
                <SimpleGrid columns={[1, 2, 3]} spacing={8}>
                    {featuredRecipes.map((recipe : any) => (
                        <Box
                            key={recipe.id}
                            p={4}
                            border="1px"
                            borderColor="gray.300"
                            borderRadius="md"
                            transition="all 0.3s"
                            backgroundColor={"gray.50"}
                        >
                            <Text fontSize="xl" fontWeight="bold" mb={2}>
                                {recipe.name}
                            </Text>
                            <Text>{recipe.description}</Text>
                            <Text>Rating: {recipe.rating}</Text>
                            <RouterLink to={`/recipes/${recipe.id}`}>
                                <Button colorScheme="teal" mt={2}>
                                    View
                                </Button>
                            </RouterLink>
                        </Box>
                    ))}
                </SimpleGrid>

                {/* Add Search Bar (Replace with your implementation) */}
                {/* Add any additional elements you discussed for the homepage */}
                <RouterLink to="/recipes">
                    <Button colorScheme="teal" size="md">
                        Explore All Recipes
                    </Button>
                </RouterLink>
            </VStack>
        </BaseLayout>
    );
};
