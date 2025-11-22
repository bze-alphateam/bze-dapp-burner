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
    Table,
    Button,
    Grid,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BurnModal } from "@/components/burn-modal";
import { RaffleModal } from "@/components/raffle-modal";
import { RaffleInfoModal } from "@/components/raffle-info-modal";

// Mock coin data
const mockCoins: Record<string, {
    denom: string;
    name: string;
    ticker: string;
    price: string;
    logo: string;
    isBurnable: boolean;
    totalBurned: string;
    totalBurnedUSD: string;
}> = {
    "ubze": { denom: "ubze", name: "BeeZee", ticker: "BZE", price: "$5.00", logo: "/images/token.svg", isBurnable: true, totalBurned: "18,400.00", totalBurnedUSD: "92,000.00" },
    "uatom": { denom: "uatom", name: "Cosmos", ticker: "ATOM", price: "$8.00", logo: "/images/token.svg", isBurnable: false, totalBurned: "1,950.50", totalBurnedUSD: "15,604.00" },
    "uosmo": { denom: "uosmo", name: "Osmosis", ticker: "OSMO", price: "$0.80", logo: "/images/token.svg", isBurnable: false, totalBurned: "5,700.75", totalBurnedUSD: "4,560.60" },
    "ujuno": { denom: "ujuno", name: "Juno", ticker: "JUNO", price: "$0.80", logo: "/images/token.svg", isBurnable: true, totalBurned: "0", totalBurnedUSD: "0" },
};

// Mock raffles for specific coins
const mockCoinRaffles: Record<string, Array<{
    id: string;
    name: string;
    contributionPrice: string;
    currentPrize: string;
    winChance: string; // e.g., "1 in 10"
    timeRemaining: string;
    totalWon: string;
    numWinners: number;
    winners: Array<{ address: string; amount: string }>;
}>> = {
    "ubze": [
        {
            id: "raffle-1",
            name: "BZE Lucky Burn",
            contributionPrice: "10.00",
            currentPrize: "500.00",
            winChance: "1 in 100",
            timeRemaining: "2 hours",
            totalWon: "1,250.00",
            numWinners: 5,
            winners: [
                { address: "bze1abc...xyz", amount: "300.00" },
                { address: "bze1def...uvw", amount: "250.00" },
                { address: "bze1ghi...rst", amount: "200.00" },
            ]
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
            totalWon: "580.00",
            numWinners: 3,
            winners: [
                { address: "bze1jkl...opq", amount: "200.00" },
                { address: "bze1mno...lmn", amount: "180.00" },
                { address: "bze1pqr...ijk", amount: "200.00" },
            ]
        }
    ],
};

// Mock burn history for specific coins
const mockCoinBurnHistory: Record<string, Array<{
    amount: string;
    usdValue: string;
    blockHeight: string;
    timestamp: string;
}>> = {
    "ubze": [
        { amount: "5,000.00", usdValue: "25,000.00", blockHeight: "1,234,567", timestamp: "2 hours ago" },
        { amount: "2,100.00", usdValue: "10,500.00", blockHeight: "1,234,564", timestamp: "5 hours ago" },
        { amount: "4,500.00", usdValue: "22,500.00", blockHeight: "1,234,561", timestamp: "8 hours ago" },
        { amount: "6,800.00", usdValue: "34,000.00", blockHeight: "1,234,558", timestamp: "12 hours ago" },
    ],
    "uatom": [
        { amount: "1,200.50", usdValue: "9,604.00", blockHeight: "1,234,566", timestamp: "3 hours ago" },
        { amount: "750.00", usdValue: "6,000.00", blockHeight: "1,234,560", timestamp: "9 hours ago" },
    ],
    "uosmo": [
        { amount: "3,400.75", usdValue: "2,720.60", blockHeight: "1,234,565", timestamp: "4 hours ago" },
        { amount: "2,300.00", usdValue: "1,840.00", blockHeight: "1,234,559", timestamp: "11 hours ago" },
    ],
};

export default function CoinDetailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const denom = searchParams.get('denom') || '';

    const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
    const [isRaffleModalOpen, setIsRaffleModalOpen] = useState(false);
    const [isRaffleInfoModalOpen, setIsRaffleInfoModalOpen] = useState(false);
    const [selectedRaffle, setSelectedRaffle] = useState<typeof mockCoinRaffles[string][0] | null>(null);

    const coinData = useMemo(() => {
        return mockCoins[denom] || null;
    }, [denom]);

    const burnHistory = useMemo(() => {
        return mockCoinBurnHistory[denom] || [];
    }, [denom]);

    const raffles = useMemo(() => {
        return mockCoinRaffles[denom] || [];
    }, [denom]);

    const handleRaffleClick = (raffle: typeof mockCoinRaffles[string][0]) => {
        setSelectedRaffle(raffle);
        setIsRaffleModalOpen(true);
    };

    if (!coinData) {
        return (
            <Container py="10">
                <VStack gap="4" align="center" py="20">
                    <Text fontSize="4xl">🤷</Text>
                    <Text fontSize="xl" fontWeight="bold">
                        Coin not found
                    </Text>
                    <Button onClick={() => router.push('/')} colorPalette="orange">
                        Go Home
                    </Button>
                </VStack>
            </Container>
        );
    }

    return (
        <Box minH="100vh" pb="12">
            <Container py={{ base: '6', md: '10' }}>
                <VStack gap="8" align="stretch">
                    {/* Back Button */}
                    <Box>
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            size="sm"
                        >
                            ← Back
                        </Button>
                    </Box>

                    {/* Coin Header */}
                    <Card.Root
                        bgGradient="to-br"
                        gradientFrom="orange.50"
                        gradientTo="orange.100"
                        _dark={{
                            gradientFrom: "orange.950",
                            gradientTo: "orange.900",
                            borderColor: "orange.500"
                        }}
                        borderWidth="4px"
                        borderColor="orange.300"
                        borderRadius="3xl"
                        shadow="lg"
                    >
                        <Card.Body>
                            <VStack gap="6" align="stretch">
                                {/* Coin Info */}
                                <HStack justify="space-between" flexWrap="wrap" gap="4">
                                    <HStack gap="4">
                                        <Box
                                            p="3"
                                            bg="white"
                                            _dark={{ bg: "gray.900" }}
                                            borderRadius="full"
                                        >
                                            <Image
                                                src={coinData.logo}
                                                alt={coinData.ticker}
                                                width="64px"
                                                height="64px"
                                                borderRadius="full"
                                            />
                                        </Box>
                                        <VStack gap="1" align="start">
                                            <HStack gap="2">
                                                <Text fontSize="2xl" fontWeight="black">
                                                    {coinData.ticker}
                                                </Text>
                                                <Badge colorPalette="gray" size="lg" variant="subtle">
                                                    {coinData.denom}
                                                </Badge>
                                            </HStack>
                                            <Text fontSize="md" color="fg.muted" fontWeight="medium">
                                                {coinData.name}
                                            </Text>
                                            <Text fontSize="lg" fontWeight="bold" color="orange.500">
                                                {coinData.price}
                                            </Text>
                                        </VStack>
                                    </HStack>

                                    <Button
                                        size="lg"
                                        colorPalette="orange"
                                        onClick={() => setIsBurnModalOpen(true)}
                                        fontWeight="bold"
                                    >
                                        🔥 Burn {coinData.ticker}
                                    </Button>
                                </HStack>

                                {/* Burnable Status - Only show if NOT burnable */}
                                {!coinData.isBurnable && (
                                    <Box
                                        p="4"
                                        bg="yellow.50"
                                        _dark={{
                                            bg: "yellow.900/30",
                                            borderColor: "yellow.500"
                                        }}
                                        borderRadius="lg"
                                        borderWidth="2px"
                                        borderColor="yellow.300"
                                    >
                                        <HStack gap="3">
                                            <Text fontSize="2xl">⚠️</Text>
                                            <VStack gap="1" align="start" flex="1">
                                                <Text fontSize="sm" fontWeight="bold" color="yellow.700" _dark={{ color: "yellow.300" }}>
                                                    Not Directly Burnable
                                                </Text>
                                                <Text fontSize="xs" color="fg.muted">
                                                    This token will be exchanged to BZE first, then the BZE will be burned.
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Box>
                                )}
                            </VStack>
                        </Card.Body>
                    </Card.Root>

                    {/* Burning Raffle Section */}
                    {raffles.length > 0 && (
                        <Box>
                            <HStack justify="space-between" mb="4" flexWrap="wrap" gap="2">
                                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="black">
                                    🔥 Burning Raffle
                                </Text>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    colorPalette="blue"
                                    onClick={() => setIsRaffleInfoModalOpen(true)}
                                >
                                    ℹ️ Info
                                </Button>
                            </HStack>
                            <VStack gap="4" align="stretch">
                                {raffles.map((raffle) => (
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
                                        borderWidth="4px"
                                        borderColor="purple.400"
                                        borderRadius="3xl"
                                        shadow="xl"
                                    >
                                        <Card.Body>
                                            <VStack gap="4" align="stretch">
                                                {/* Raffle Header */}
                                                <HStack justify="space-between" flexWrap="wrap" gap="2">
                                                    <VStack gap="1" align="start">
                                                        <Text fontSize="xl" fontWeight="black" color="purple.600" _dark={{ color: "purple.300" }}>
                                                            {raffle.name}
                                                        </Text>
                                                        <HStack gap="2">
                                                            <Badge colorPalette="purple" size="sm">
                                                                ⏰ {raffle.timeRemaining} left
                                                            </Badge>
                                                            <Badge colorPalette="pink" size="sm">
                                                                {raffle.winChance} chance
                                                            </Badge>
                                                        </HStack>
                                                    </VStack>
                                                    <Button
                                                        colorPalette="purple"
                                                        size={{ base: "md", md: "lg" }}
                                                        fontWeight="bold"
                                                        onClick={() => handleRaffleClick(raffle)}
                                                    >
                                                        🎫 Join Raffle
                                                    </Button>
                                                </HStack>

                                                {/* Prize and Stats Grid */}
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="3">
                                                    {/* Current Prize */}
                                                    <Box
                                                        p="4"
                                                        bg="white"
                                                        _dark={{ bg: "gray.800" }}
                                                        borderRadius="lg"
                                                        textAlign="center"
                                                    >
                                                        <VStack gap="1">
                                                            <Text fontSize="xs" color="fg.muted" fontWeight="bold">
                                                                🏆 WIN UP TO
                                                            </Text>
                                                            <Text fontSize="2xl" fontWeight="black" color="orange.500">
                                                                {raffle.currentPrize}
                                                            </Text>
                                                            <Text fontSize="xs" color="fg.muted">
                                                                {coinData.ticker}
                                                            </Text>
                                                        </VStack>
                                                    </Box>

                                                    {/* Contribution Price */}
                                                    <Box
                                                        p="4"
                                                        bg="white"
                                                        _dark={{ bg: "gray.800" }}
                                                        borderRadius="lg"
                                                        textAlign="center"
                                                    >
                                                        <VStack gap="1">
                                                            <Text fontSize="xs" color="fg.muted" fontWeight="bold">
                                                                💰 CONTRIBUTION
                                                            </Text>
                                                            <Text fontSize="2xl" fontWeight="black" color="purple.500">
                                                                {raffle.contributionPrice}
                                                            </Text>
                                                            <Text fontSize="xs" color="fg.muted">
                                                                {coinData.ticker}
                                                            </Text>
                                                        </VStack>
                                                    </Box>

                                                    {/* Total Won */}
                                                    <Box
                                                        p="4"
                                                        bg="white"
                                                        _dark={{ bg: "gray.800" }}
                                                        borderRadius="lg"
                                                        textAlign="center"
                                                    >
                                                        <VStack gap="1">
                                                            <Text fontSize="xs" color="fg.muted" fontWeight="bold">
                                                                💰 TOTAL WON
                                                            </Text>
                                                            <Text fontSize="2xl" fontWeight="black" color="green.500">
                                                                {raffle.totalWon}
                                                            </Text>
                                                            <Text fontSize="xs" color="fg.muted">
                                                                by {raffle.numWinners} winners
                                                            </Text>
                                                        </VStack>
                                                    </Box>
                                                </Grid>

                                                {/* Winners List */}
                                                {raffle.winners.length > 0 && (
                                                    <Box>
                                                        <Text fontSize="sm" fontWeight="bold" mb="2" color="purple.600" _dark={{ color: "purple.400" }}>
                                                            🎉 Recent Winners
                                                        </Text>
                                                        <VStack gap="2" align="stretch">
                                                            {raffle.winners.map((winner, idx) => (
                                                                <HStack
                                                                    key={idx}
                                                                    justify="space-between"
                                                                    p="3"
                                                                    bg="white"
                                                                    _dark={{ bg: "gray.800" }}
                                                                    borderRadius="md"
                                                                >
                                                                    <Text fontSize="sm" fontFamily="mono" color="fg.muted">
                                                                        {winner.address}
                                                                    </Text>
                                                                    <Text fontSize="sm" fontWeight="bold" color="green.500">
                                                                        +{winner.amount} {coinData.ticker}
                                                                    </Text>
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                    </Box>
                                                )}
                                            </VStack>
                                        </Card.Body>
                                    </Card.Root>
                                ))}
                            </VStack>
                        </Box>
                    )}

                    {/* Total Burned Statistics */}
                    <Card.Root
                        bgGradient="to-br"
                        gradientFrom="orange.50"
                        gradientTo="orange.100"
                        _dark={{
                            gradientFrom: "orange.950",
                            gradientTo: "orange.900",
                            borderColor: "orange.500"
                        }}
                        borderWidth="3px"
                        borderColor="orange.300"
                        borderRadius="2xl"
                        shadow="lg"
                    >
                        <Card.Body>
                            <VStack gap="2" align="center" py="4">
                                <Text fontSize={{ base: "sm", md: "md" }} fontWeight="semibold" color="orange.600" _dark={{ color: "orange.400" }} textTransform="uppercase">
                                    💰 Total {coinData.ticker} Burned
                                </Text>
                                <VStack gap="1" align="center">
                                    <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="orange.500">
                                        {coinData.totalBurned}
                                    </Text>
                                    {parseFloat(coinData.totalBurnedUSD) > 0 && (
                                        <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted" fontWeight="semibold">
                                            ≈ ${coinData.totalBurnedUSD}
                                        </Text>
                                    )}
                                </VStack>
                                <Badge colorPalette="orange" variant="subtle" size="md" borderRadius="full">
                                    All Time
                                </Badge>
                            </VStack>
                        </Card.Body>
                    </Card.Root>

                    {/* Burn History */}
                    {burnHistory.length > 0 ? (
                        <Box>
                            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="black" mb="4">
                                🔥 Recent Burns
                            </Text>
                            <Box
                                borderRadius="3xl"
                                borderWidth="3px"
                                borderColor="orange.300"
                                _dark={{ borderColor: "orange.700" }}
                                overflow="hidden"
                                bg="bg.panel"
                                shadow="xl"
                            >
                                {/* Desktop Table View */}
                                <Box display={{ base: "none", md: "block" }} overflowX="auto">
                                    <Table.Root size="md" variant="outline">
                                        <Table.Header>
                                            <Table.Row bg="orange.100" _dark={{ bg: "orange.900" }}>
                                                <Table.ColumnHeader fontWeight="black">Amount Burned</Table.ColumnHeader>
                                                <Table.ColumnHeader fontWeight="black">USD Value</Table.ColumnHeader>
                                                <Table.ColumnHeader fontWeight="black">Block Height</Table.ColumnHeader>
                                                <Table.ColumnHeader fontWeight="black">Time</Table.ColumnHeader>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {burnHistory.map((burn, idx) => (
                                                <Table.Row
                                                    key={idx}
                                                    _hover={{
                                                        bg: "orange.50",
                                                        _dark: { bg: "orange.950" }
                                                    }}
                                                    transition="all 0.2s"
                                                >
                                                    <Table.Cell>
                                                        <Text fontWeight="black" fontSize="md" color="orange.500">
                                                            {burn.amount} {coinData.ticker}
                                                        </Text>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <Text fontSize="sm" color="fg.muted">
                                                            ${burn.usdValue}
                                                        </Text>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <Badge colorPalette="gray" variant="subtle" size="md" borderRadius="full">
                                                            #{burn.blockHeight}
                                                        </Badge>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <Text fontSize="sm" color="fg.muted">
                                                            {burn.timestamp}
                                                        </Text>
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table.Root>
                                </Box>

                                {/* Mobile Card View */}
                                <Box display={{ base: "block", md: "none" }}>
                                    <VStack gap="0" align="stretch">
                                        {burnHistory.map((burn, idx) => (
                                            <Box
                                                key={idx}
                                                p="4"
                                                borderBottomWidth={idx < burnHistory.length - 1 ? "2px" : "0"}
                                                borderColor="orange.200"
                                                _dark={{ borderColor: "orange.800" }}
                                            >
                                                <VStack gap="2" align="stretch">
                                                    <HStack justify="space-between">
                                                        <Text fontWeight="black" color="orange.500" fontSize="md">
                                                            {burn.amount} {coinData.ticker}
                                                        </Text>
                                                        <Text fontSize="sm" color="fg.muted">
                                                            ${burn.usdValue}
                                                        </Text>
                                                    </HStack>
                                                    <HStack justify="space-between">
                                                        <Badge colorPalette="gray" variant="subtle" size="sm" borderRadius="full">
                                                            #{burn.blockHeight}
                                                        </Badge>
                                                        <Text fontSize="xs" color="fg.muted">
                                                            {burn.timestamp}
                                                        </Text>
                                                    </HStack>
                                                </VStack>
                                            </Box>
                                        ))}
                                    </VStack>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Card.Root>
                            <Card.Body>
                                <VStack gap="3" align="center" py="8">
                                    <Text fontSize="4xl">🔍</Text>
                                    <Text fontSize="xl" fontWeight="bold">
                                        No Burns Yet
                                    </Text>
                                    <Text fontSize="sm" color="fg.muted" textAlign="center">
                                        This token hasn&apos;t been burned yet. Be the first to toss it into the fire!
                                    </Text>
                                    <Button
                                        colorPalette="orange"
                                        onClick={() => setIsBurnModalOpen(true)}
                                        mt="2"
                                    >
                                        🔥 Burn Some Now
                                    </Button>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    )}
                </VStack>
            </Container>

            {/* Burn Modal with preselected coin */}
            <BurnModal
                isOpen={isBurnModalOpen}
                onClose={() => setIsBurnModalOpen(false)}
                preselectedCoin={denom}
            />

            {/* Raffle Modal */}
            {selectedRaffle && (
                <RaffleModal
                    isOpen={isRaffleModalOpen}
                    onClose={() => setIsRaffleModalOpen(false)}
                    raffleName={selectedRaffle.name}
                    contributionPrice={selectedRaffle.contributionPrice}
                    currentPrize={selectedRaffle.currentPrize}
                    winChance={selectedRaffle.winChance}
                    ticker={coinData?.ticker || ''}
                />
            )}

            {/* Raffle Info Modal */}
            <RaffleInfoModal
                isOpen={isRaffleInfoModalOpen}
                onClose={() => setIsRaffleInfoModalOpen(false)}
            />
        </Box>
    );
}
