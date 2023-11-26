import { ReactNode } from "react";
import { VStack, Image } from "@chakra-ui/react";
import { Header } from "./Header.tsx";
import { Page } from "./Page.tsx";

export const BaseLayout = ({
                               children,
                               rightMenu,
                           }: {
    children: ReactNode;
    rightMenu?: ReactNode;
}) => {
    return (
        <VStack
            //the url to the top-down.jpg
            bgImage="../../resources/top-down.jpg"
            bgSize="cover"
            bgPosition="center"
            h={"100vh"}
            w={"100%"}
            position="relative"

        >
            {/* Blurred background overlay */}
            <Image
                src="../../resources/top-down.jpg" // Replace with your image path
                alt="background-image"
                w="100%"
                h="100%"
                opacity={0.1}
                filter="blur(4px)"
                position="absolute"
            />

            <Header rightMenu={rightMenu} />

            <Page>{children}</Page>
        </VStack>
    );
};
