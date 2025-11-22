'use client';

import {
    Box,
    Container,
    VStack,
    HStack,
    Text,
    Image,
    Card,
    Badge,
    Grid,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { RaffleInfo } from "@/components/raffle-info";

// Mock coin data
const mockCoins: Record<string, {
    denom: string;
    name: string;
    ticker: string;
    price: string;
    logo: string;
}> = {
    "ubze": { denom: "ubze", name: "BeeZee", ticker: "BZE", price: "$5.00", logo: "/images/token.svg" },
    "uatom": { denom: "uatom", name: "Cosmos", ticker: "ATOM", price: "$8.00", logo: "/images/token.svg" },
};

// Mock raffles for specific coins
const mockCoinRaffles: Record<string, Array<{
    id: string;
    name: string;
    contributionPrice: string;
    currentPrize: string;
    winChance: string;
    timeRemaining: string;
}>> = {
    "ubze": [
        {
            id: "raffle-1",
            name: "BZE Lucky Burn",
            contributionPrice: "10.00",
            currentPrize: "500.00",
            winChance: "1 in 100",
            timeRemaining: "2 hours",
        }
    ],
    "uatom": [
        {
            id: "raffle-2",
            name: "ATOM Mega Raffle",
            contributionPrice: "5.00",
            currentPrize: "200.00",
            winChance: "1 in 50",
            timeRemaining: "45 minutes",
        }
    ],
};

export default function RafflesPage() {
    const router = useRouter();

    // Aggregate all raffles with their coin info
    const allRaffles = Object.entries(mockCoinRaffles).flatMap(([denom, raffles]) =>
        raffles.map(raffle => ({
            ...raffle,
            denom,
            coinData: mockCoins[denom],
        }))
    );

    const handleRaffleClick = (denom: string) => {
        router.push(`/coin?denom=${denom}`);
    };

    return (
        <Box minH="100vh" pb="12">
            <Container py={{ base: '6', md: '10' }}>
                <VStack gap="8" align="stretch">
                    {/* Page Header */}
                    <VStack gap="2" align="start">
                        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black">
                            🔥 Burning Raffles
                        </Text>
                        <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted">
                            Join active raffles and win rewards by burning tokens!
                        </Text>
                    </VStack>

                    {/* Info Card - What are Burning Raffles */}
                    <Card.Root
                        bg="blue.50"
                        _dark={{
                            bg: "blue.950/30",
                            borderColor: "blue.500"
                        }}
                        borderWidth="2px"
                        borderColor="blue.300"
                        borderRadius="2xl"
                    >
                        <Card.Body>
                            <VStack gap="4" align="stretch">
                                <HStack gap="3">
                                    <Text fontSize="3xl">ℹ️</Text>
                                    <Text fontSize="xl" fontWeight="black" color="blue.700" _dark={{ color: "blue.300" }}>
                                        What are Burning Raffles?
                                    </Text>
                                </HStack>
                                <RaffleInfo />
                            </VStack>
                        </Card.Body>
                    </Card.Root>

                    {/* Raffles Grid */}
                    {allRaffles.length > 0 ? (
                        <Grid
                            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                            gap="6"
                        >
                            {allRaffles.map((raffle) => (
                                <Card.Root
                                    key={raffle.id}
                                    bgGradient="to-br"
                                    gradientFrom="purple.50"
                                    gradientVia="pink.50"
                                    gradientTo="orange.50"
                                    _dark={{
                                        gradientFrom: "purple.950",
                                        gradientVia: "pink.950",
                                        gradientTo: "orange.950",
                                        borderColor: "purple.500"
                                    }}
                                    borderWidth="3px"
                                    borderColor="purple.400"
                                    borderRadius="2xl"
                                    shadow="lg"
                                    cursor="pointer"
                                    onClick={() => handleRaffleClick(raffle.denom)}
                                    transition="all 0.2s"
                                    _hover={{
                                        transform: "translateY(-4px)",
                                        shadow: "xl",
                                        borderColor: "purple.500",
                                    }}
                                >
                                    <Card.Body>
                                        <VStack gap="4" align="stretch">
                                            {/* Coin Info Header */}
                                            <HStack gap="3">
                                                <Box
                                                    p="2"
                                                    bg="white"
                                                    _dark={{ bg: "gray.900" }}
                                                    borderRadius="full"
                                                >
                                                    <Image
                                                        src={raffle.coinData.logo}
                                                        alt={raffle.coinData.ticker}
                                                        width="40px"
                                                        height="40px"
                                                        borderRadius="full"
                                                    />
                                                </Box>
                                                <VStack gap="0" align="start" flex="1">
                                                    <Text fontSize="lg" fontWeight="black" color="purple.600" _dark={{ color: "purple.300" }}>
                                                        {raffle.name}
                                                    </Text>
                                                    <HStack gap="1">
                                                        <Text fontSize="sm" fontWeight="bold">
                                                            {raffle.coinData.ticker}
                                                        </Text>
                                                        <Text fontSize="xs" color="fg.muted">
                                                            • {raffle.coinData.price}
                                                        </Text>
                                                    </HStack>
                                                </VStack>
                                            </HStack>

                                            {/* Time and Chance Badges */}
                                            <HStack gap="2" flexWrap="wrap">
                                                <Badge colorPalette="purple" size="sm">
                                                    ⏰ {raffle.timeRemaining}
                                                </Badge>
                                                <Badge colorPalette="pink" size="sm">
                                                    {raffle.winChance}
                                                </Badge>
                                            </HStack>

                                            {/* Prize and Contribution Info */}
                                            <Grid templateColumns="1fr 1fr" gap="3">
                                                {/* Current Prize */}
                                                <Box
                                                    p="3"
                                                    bg="white"
                                                    _dark={{ bg: "gray.800" }}
                                                    borderRadius="lg"
                                                    textAlign="center"
                                                >
                                                    <VStack gap="1">
                                                        <Text fontSize="xs" color="fg.muted" fontWeight="bold">
                                                            🏆 PRIZE
                                                        </Text>
                                                        <Text fontSize="xl" fontWeight="black" color="orange.500">
                                                            {raffle.currentPrize}
                                                        </Text>
                                                        <Text fontSize="xs" color="fg.muted">
                                                            {raffle.coinData.ticker}
                                                        </Text>
                                                    </VStack>
                                                </Box>

                                                {/* Contribution Price */}
                                                <Box
                                                    p="3"
                                                    bg="white"
                                                    _dark={{ bg: "gray.800" }}
                                                    borderRadius="lg"
                                                    textAlign="center"
                                                >
                                                    <VStack gap="1">
                                                        <Text fontSize="xs" color="fg.muted" fontWeight="bold">
                                                            💰 CONTRIBUTION
                                                        </Text>
                                                        <Text fontSize="xl" fontWeight="black" color="purple.500">
                                                            {raffle.contributionPrice}
                                                        </Text>
                                                        <Text fontSize="xs" color="fg.muted">
                                                            {raffle.coinData.ticker}
                                                        </Text>
                                                    </VStack>
                                                </Box>
                                            </Grid>

                                            {/* Click to view CTA */}
                                            <Box
                                                p="2"
                                                bg="purple.100"
                                                _dark={{ bg: "purple.900/30" }}
                                                borderRadius="md"
                                                textAlign="center"
                                            >
                                                <Text fontSize="xs" fontWeight="bold" color="purple.700" _dark={{ color: "purple.300" }}>
                                                    Click to join →
                                                </Text>
                                            </Box>
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            ))}
                        </Grid>
                    ) : (
                        <Card.Root>
                            <Card.Body>
                                <VStack gap="3" align="center" py="12">
                                    <Text fontSize="4xl">🔥</Text>
                                    <Text fontSize="xl" fontWeight="bold">
                                        No Active Raffles
                                    </Text>
                                    <Text fontSize="sm" color="fg.muted" textAlign="center">
                                        There are no active raffles at the moment. Check back later!
                                    </Text>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    )}
                </VStack>
            </Container>
        </Box>
    );
}
