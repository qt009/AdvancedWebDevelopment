import { Link as RouterLink } from "react-router-dom";
import { BaseLayout } from "../layout/BaseLayout.tsx";
import { VStack, Text, Button } from "@chakra-ui/react";

export const HomePage = () => {
  return (
      <BaseLayout>
        <VStack spacing={8} align="center">
          {/* Featured Recipes Section (Replace with your data) */}
          <Text fontSize="2xl" fontWeight="bold">
            Featured Recipes
          </Text>
          {/* Featured Recipe Cards (Replace with your data) */}
          {/* For simplicity, you can create a separate FeaturedRecipeCard component */}
          {/* <FeaturedRecipeCard /> */}
          {/* <FeaturedRecipeCard /> */}
          {/* <FeaturedRecipeCard /> */}
          {/* Add Search Bar (Replace with your implementation) */}
          <input type="text" placeholder="Search for recipes..." />
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
