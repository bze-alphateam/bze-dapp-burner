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
import { useBurningHistory } from "@/hooks/useBurningHistory";
import { useAssets } from "@/hooks/useAssets";
import { useAssetsValue } from "@/hooks/useAssetsValue";
import { useNextBurning } from "@/hooks/useNextBurning";
import BigNumber from "bignumber.js";
import { prettyAmount, uAmountToBigNumberAmount } from "@/utils/amount";
import { truncateDenom } from "@/utils/denom";

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

export default function CoinDetailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const denom = searchParams.get('coin') || '';

    const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
    const [isRaffleModalOpen, setIsRaffleModalOpen] = useState(false);
    const [isRaffleInfoModalOpen, setIsRaffleInfoModalOpen] = useState(false);
    const [selectedRaffle, setSelectedRaffle] = useState<typeof mockCoinRaffles[string][0] | null>(null);

    // Get asset from useAssets
    const { getAsset, denomDecimals, isLoading: isLoadingAssets } = useAssets();
    const { totalUsdValue } = useAssetsValue();
    const asset = getAsset(denom);

    // Fetch burn history for this specific coin
    const { burnHistory, isLoading: isLoadingHistory } = useBurningHistory(denom);

    // Fetch next burning data
    const { nextBurn, isLoading: isLoadingNextBurn } = useNextBurning();

    // Get next burning info for this specific coin
    const nextCoinBurn = useMemo(() => {
        if (!nextBurn?.coins) return null;

        const coin = nextBurn.coins.find(c => c.denom === denom);
        if (!coin) return null;

        const decimals = denomDecimals(denom);
        const amount = uAmountToBigNumberAmount(coin.amount, decimals);
        const usdValue = totalUsdValue([{ denom, amount }]);

        return {
            amount,
            usdValue,
            date: nextBurn.date,
        };
    }, [nextBurn, denom, denomDecimals, totalUsdValue]);

    // Calculate total burned for this coin
    const totalBurned = useMemo(() => {
        return burnHistory.reduce((total, burn) => {
            return total.plus(burn.amount);
        }, BigNumber(0));
    }, [burnHistory]);

    // Calculate USD value of total burned
    const totalBurnedUsdValue = useMemo(() => {
        if (!asset || totalBurned.isZero()) return BigNumber(0);
        return totalUsdValue([{ denom: asset.denom, amount: totalBurned }]);
    }, [totalBurned, asset, totalUsdValue]);

    const raffles = useMemo(() => {
        return mockCoinRaffles[denom] || [];
    }, [denom]);

    const handleRaffleClick = (raffle: typeof mockCoinRaffles[string][0]) => {
        setSelectedRaffle(raffle);
        setIsRaffleModalOpen(true);
    };

    // Show loading state
    if (isLoadingAssets) {
        return (
            <Container py="10">
                <VStack gap="4" align="center" py="20">
                    <Text fontSize="xl" color="fg.muted">
                        Loading...
                    </Text>
                </VStack>
            </Container>
        );
    }

    // Show 404 if coin not found
    if (!asset) {
        return (
            <Container py="10">
                <VStack gap="4" align="center" py="20">
                    <Text fontSize="4xl">🤷</Text>
                    <Text fontSize="xl" fontWeight="bold">
                        Coin not found
                    </Text>
                    <Text fontSize="sm" color="fg.muted">
                        The coin &quot;{denom}&quot; does not exist.
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
                                                src={asset.logo || "/images/token.svg"}
                                                alt={asset.ticker}
                                                width="64px"
                                                height="64px"
                                                borderRadius="full"
                                            />
                                        </Box>
                                        <VStack gap="1" align="start">
                                            <HStack gap="2">
                                                <Text fontSize="2xl" fontWeight="black">
                                                    {asset.ticker}
                                                </Text>
                                                {asset.verified && (
                                                    <Badge colorPalette="green" size="sm" variant="solid">
                                                        ✓ Verified
                                                    </Badge>
                                                )}
                                            </HStack>
                                            <Text fontSize="md" color="fg.muted" fontWeight="medium">
                                                {asset.name}
                                            </Text>
                                            <Badge colorPalette="gray" size="sm" variant="subtle" maxW="full" overflow="hidden" textOverflow="ellipsis">
                                                {truncateDenom(asset.denom)}
                                            </Badge>
                                        </VStack>
                                    </HStack>

                                    <Button
                                        size="lg"
                                        colorPalette="orange"
                                        onClick={() => setIsBurnModalOpen(true)}
                                        fontWeight="bold"
                                    >
                                        🔥 Burn {asset.ticker}
                                    </Button>
                                </HStack>
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
                                    💰 Total {asset.ticker} Burned
                                </Text>
                                {isLoadingHistory ? (
                                    <Text fontSize="md" color="fg.muted">
                                        Loading...
                                    </Text>
                                ) : (
                                    <VStack gap="1" align="center">
                                        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="orange.500">
                                            {prettyAmount(totalBurned)}
                                        </Text>
                                        {totalBurnedUsdValue.gt(0) && (
                                            <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted" fontWeight="semibold">
                                                ≈ ${prettyAmount(totalBurnedUsdValue)}
                                            </Text>
                                        )}
                                    </VStack>
                                )}
                                <Badge colorPalette="orange" variant="subtle" size="md" borderRadius="full">
                                    All Time
                                </Badge>
                            </VStack>
                        </Card.Body>
                    </Card.Root>

                    {/* Next Burning Section */}
                    {!isLoadingNextBurn && nextCoinBurn && (
                        <Card.Root
                            bgGradient="to-br"
                            gradientFrom="yellow.50"
                            gradientVia="orange.100"
                            gradientTo="red.100"
                            _dark={{
                                gradientFrom: "orange.950",
                                gradientVia: "orange.900",
                                gradientTo: "red.950",
                                borderColor: "orange.500"
                            }}
                            borderWidth="3px"
                            borderColor="orange.400"
                            borderRadius="2xl"
                            shadow="lg"
                        >
                            <Card.Body>
                                <VStack gap="4" align="stretch">
                                    <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="black" color="orange.600" _dark={{ color: "orange.400" }} textTransform="uppercase" textAlign="center">
                                        🔥 Next Burning
                                    </Text>

                                    <VStack gap="2" align="center">
                                        <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                                            Ready to burn
                                        </Text>
                                        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color="orange.500">
                                            {prettyAmount(nextCoinBurn.amount)} {asset.ticker}
                                        </Text>
                                        {nextCoinBurn.usdValue.gt(0) && (
                                            <Text fontSize={{ base: "sm", md: "md" }} color="fg.muted" fontWeight="medium">
                                                ≈ ${prettyAmount(nextCoinBurn.usdValue)}
                                            </Text>
                                        )}
                                    </VStack>

                                    <Box textAlign="center">
                                        <Text fontSize="xs" color="fg.muted" fontWeight="bold" mb="1">
                                            SCHEDULED FOR
                                        </Text>
                                        <Badge colorPalette="orange" size="md" variant="solid">
                                            {nextCoinBurn.date.toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Badge>
                                    </Box>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    )}

                    {/* Burn History */}
                    <Box>
                        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="black" mb="4">
                            🔥 Recent Burns
                        </Text>
                        {isLoadingHistory ? (
                            <Card.Root>
                                <Card.Body>
                                    <Text textAlign="center" py="8" color="fg.muted">
                                        Loading burn history...
                                    </Text>
                                </Card.Body>
                            </Card.Root>
                        ) : burnHistory.length > 0 ? (
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
                                            {burnHistory.map((burn, idx) => {
                                                const assetData = getAsset(burn.denom);
                                                const ticker = assetData?.ticker || burn.denom;
                                                const formattedAmount = prettyAmount(burn.amount);
                                                const formattedUsdValue = prettyAmount(burn.usdValue);

                                                return (
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
                                                                {formattedAmount} {ticker}
                                                            </Text>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Text fontSize="sm" color="fg.muted">
                                                                {burn.usdValue.gt(0) ? `$${formattedUsdValue}` : '-'}
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
                                                );
                                            })}
                                        </Table.Body>
                                    </Table.Root>
                                </Box>

                                {/* Mobile Card View */}
                                <Box display={{ base: "block", md: "none" }}>
                                    <VStack gap="0" align="stretch">
                                        {burnHistory.map((burn, idx) => {
                                            const assetData = getAsset(burn.denom);
                                            const ticker = assetData?.ticker || burn.denom;
                                            const formattedAmount = prettyAmount(burn.amount);
                                            const formattedUsdValue = prettyAmount(burn.usdValue);

                                            return (
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
                                                                {formattedAmount} {ticker}
                                                            </Text>
                                                            <Text fontSize="sm" color="fg.muted">
                                                                {burn.usdValue.gt(0) ? `$${formattedUsdValue}` : '-'}
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
                                            );
                                        })}
                                    </VStack>
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
                    </Box>
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
                    ticker={asset.ticker}
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
