import { Box, Flex, HStack, Link } from "@chakra-ui/react";
import { ReactNode } from "react";
import { NavLink } from "react-router-dom"; // Make sure to import NavLink if you're using React Router

export const Header = ({ rightMenu }: { rightMenu?: ReactNode }) => {
    return (
        <HStack bg={"rgba(137, 196, 244, 1)"} p={8} w={"100%"} backdropFilter="blur(5px)">
            <Box flex={1}>
                <Link as={NavLink} to="/">
                    FWE WS 2324
                </Link>
            </Box>
            <Flex justifyContent={"flex-end"} flex={1}>
                <Link as={NavLink} to="/recipes" mr={4}>
                    Recipes
                </Link>
                <Link as={NavLink} to="/categories" mr={4}>
                    Categories
                </Link>
                <Link as={NavLink} to="/ingredients" mr={4}>
                    Ingredients
                </Link>
                {rightMenu}
            </Flex>
        </HStack>
    );
};
