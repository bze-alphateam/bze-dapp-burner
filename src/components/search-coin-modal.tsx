'use client';

import {
    Box,
    HStack,
    Image,
    Input,
    Portal,
    Text,
    VStack,
    Dialog,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { LuSearch } from "react-icons/lu";
import { useRouter } from "next/navigation";

// Mock coin data (this will be replaced with real data later)
const mockCoins = [
    { denom: "ubze", name: "BeeZee", ticker: "BZE", logo: "/images/token.svg" },
    { denom: "uatom", name: "Cosmos", ticker: "ATOM", logo: "/images/token.svg" },
    { denom: "uosmo", name: "Osmosis", ticker: "OSMO", logo: "/images/token.svg" },
    { denom: "ujuno", name: "Juno", ticker: "JUNO", logo: "/images/token.svg" },
    { denom: "ustars", name: "Stargaze", ticker: "STARS", logo: "/images/token.svg" },
    { denom: "uakt", name: "Akash", ticker: "AKT", logo: "/images/token.svg" },
    { denom: "uregen", name: "Regen", ticker: "REGEN", logo: "/images/token.svg" },
    { denom: "usomm", name: "Sommelier", ticker: "SOMM", logo: "/images/token.svg" },
    { denom: "uixo", name: "IXO", ticker: "IXO", logo: "/images/token.svg" },
    { denom: "uluna", name: "Terra", ticker: "LUNA", logo: "/images/token.svg" },
];

interface SearchCoinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCoinSelect?: (denom: string) => void;
}

export const SearchCoinModal = ({ isOpen, onClose, onCoinSelect }: SearchCoinModalProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    // Filter coins based on search query
    const filteredCoins = useMemo(() => {
        if (!searchQuery.trim()) {
            return mockCoins;
        }

        const query = searchQuery.toLowerCase();
        return mockCoins.filter(
            (coin) =>
                coin.name.toLowerCase().includes(query) ||
                coin.ticker.toLowerCase().includes(query) ||
                coin.denom.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleCoinClick = (denom: string) => {
        if (onCoinSelect) {
            onCoinSelect(denom);
        } else {
            // Navigate to coin detail page with query param
            router.push(`/coin?denom=${encodeURIComponent(denom)}`);
        }
        onClose();
    };

    const handleClose = () => {
        setSearchQuery("");
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content
                        maxW={{ base: "90vw", md: "500px" }}
                        borderRadius="2xl"
                        borderWidth="3px"
                        borderColor="orange.400"
                    >
                        <Dialog.Header>
                            <Dialog.Title fontSize="xl" fontWeight="black">
                                🔍 Search Coins
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <VStack gap="4" align="stretch">
                                {/* Search Input */}
                                <Box position="relative">
                                    <Input
                                        size="lg"
                                        placeholder="Search by name or ticker..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        pl="12"
                                    />
                                    <Box
                                        position="absolute"
                                        left="4"
                                        top="50%"
                                        transform="translateY(-50%)"
                                        color="fg.muted"
                                    >
                                        <LuSearch size="20" />
                                    </Box>
                                </Box>

                                {/* Coins List */}
                                <Box
                                    maxH="400px"
                                    overflowY="auto"
                                    borderRadius="lg"
                                    borderWidth="1px"
                                    borderColor="border"
                                >
                                    {filteredCoins.length > 0 ? (
                                        <VStack gap="0" align="stretch">
                                            {filteredCoins.map((coin, idx) => (
                                                <Box
                                                    key={coin.denom}
                                                    p="4"
                                                    cursor="pointer"
                                                    borderBottomWidth={idx < filteredCoins.length - 1 ? "1px" : "0"}
                                                    borderColor="border"
                                                    _hover={{
                                                        bg: "orange.50",
                                                        _dark: { bg: "gray.800" }
                                                    }}
                                                    transition="all 0.2s"
                                                    onClick={() => handleCoinClick(coin.denom)}
                                                >
                                                    <HStack gap="3">
                                                        <Box
                                                            p="1"
                                                            bg="orange.50"
                                                            _dark={{ bg: "orange.950" }}
                                                            borderRadius="full"
                                                        >
                                                            <Image
                                                                src={coin.logo}
                                                                alt={coin.ticker}
                                                                width="40px"
                                                                height="40px"
                                                                borderRadius="full"
                                                            />
                                                        </Box>
                                                        <VStack gap="0" align="start" flex="1">
                                                            <HStack gap="2">
                                                                <Text fontWeight="bold" fontSize="md">
                                                                    {coin.ticker}
                                                                </Text>
                                                                <Text fontSize="xs" color="fg.muted">
                                                                    {coin.denom}
                                                                </Text>
                                                            </HStack>
                                                            <Text fontSize="sm" color="fg.muted">
                                                                {coin.name}
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Box p="8" textAlign="center">
                                            <Text fontSize="lg" fontWeight="bold" color="fg.muted" mb="2">
                                                🤷 No coins found
                                            </Text>
                                            <Text fontSize="sm" color="fg.muted">
                                                Try a different search term
                                            </Text>
                                        </Box>
                                    )}
                                </Box>

                                {/* Results count */}
                                {searchQuery && (
                                    <Text fontSize="sm" color="fg.muted" textAlign="center">
                                        Found {filteredCoins.length} coin{filteredCoins.length !== 1 ? 's' : ''}
                                    </Text>
                                )}
                            </VStack>
                        </Dialog.Body>

                        <Dialog.CloseTrigger />
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
