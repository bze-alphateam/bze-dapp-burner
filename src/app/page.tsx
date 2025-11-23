'use client';

import {
    Box,
    Container,
    Grid,
    GridItem,
    HStack,
    VStack,
    Text,
    Image,
    Card,
    Table,
    Badge,
    Separator,
    Button,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BurnModal } from "@/components/burn-modal";
import { useBurningHistory } from "@/hooks/useBurningHistory";
import { useAssets } from "@/hooks/useAssets";
import { useAssetsValue } from "@/hooks/useAssetsValue";
import BigNumber from "bignumber.js";
import { prettyAmount } from "@/utils/amount";

// Mock data for pending burns
const mockPendingBurns = [
    { denom: "ubze", name: "BeeZee", ticker: "BZE", amount: "1,234.56", usdValue: "6,172.80", logo: "/images/token.svg", isLP: false },
    { denom: "uatom", name: "Cosmos", ticker: "ATOM", amount: "567.89", usdValue: "4,543.12", logo: "/images/token.svg", isLP: false },
    { denom: "lp-bze-atom", name: "BZE/ATOM LP", ticker: "BZE/ATOM", amount: "890.12", usdValue: "712.10", logo: "/images/token.svg", logo2: "/images/token.svg", isLP: true },
];

// Token Logo Component - supports single token or LP pair
const TokenLogo = ({
    logo,
    logo2,
    isLP,
    size = "48px",
    alt = "Token"
}: {
    logo: string;
    logo2?: string;
    isLP?: boolean;
    size?: string;
    alt?: string;
}) => {
    if (isLP && logo2) {
        // LP tokens show two overlapping logos
        return (
            <Box position="relative" width={size} height={size}>
                <Image
                    src={logo}
                    alt={alt}
                    width={size}
                    height={size}
                    borderRadius="full"
                    position="absolute"
                    left="0"
                    top="0"
                    borderWidth="2px"
                    borderColor="bg.panel"
                    zIndex="1"
                />
                <Image
                    src={logo2}
                    alt={alt}
                    width={size}
                    height={size}
                    borderRadius="full"
                    position="absolute"
                    left="30%"
                    top="0"
                    borderWidth="2px"
                    borderColor="bg.panel"
                    zIndex="2"
                />
            </Box>
        );
    }

    // Single token logo
    return (
        <Image
            src={logo}
            alt={alt}
            width={size}
            height={size}
            borderRadius="full"
        />
    );
};

// Countdown Timer Component with playful design
const CountdownTimer = ({ targetTime }: { targetTime: number }) => {
    const [timeLeft, setTimeLeft] = useState(targetTime);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return (
        <VStack gap="2">
            <HStack gap="2" fontFamily="mono" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black">
                <Box
                    px={{ base: "4", md: "5" }}
                    py={{ base: "3", md: "4" }}
                    bgGradient="to-br"
                    gradientFrom="orange.400"
                    gradientTo="red.500"
                    borderRadius="2xl"
                    color="white"
                    minW={{ base: "60px", md: "70px" }}
                    textAlign="center"
                    shadow="xl"
                    transform="rotate(-2deg)"
                    _hover={{ transform: "rotate(0deg) scale(1.05)" }}
                    transition="all 0.3s"
                >
                    {String(hours).padStart(2, '0')}
                </Box>
                <Text color="orange.500" fontSize={{ base: "3xl", md: "4xl" }}>🔥</Text>
                <Box
                    px={{ base: "4", md: "5" }}
                    py={{ base: "3", md: "4" }}
                    bgGradient="to-br"
                    gradientFrom="orange.400"
                    gradientTo="red.500"
                    borderRadius="2xl"
                    color="white"
                    minW={{ base: "60px", md: "70px" }}
                    textAlign="center"
                    shadow="xl"
                    transform="rotate(2deg)"
                    _hover={{ transform: "rotate(0deg) scale(1.05)" }}
                    transition="all 0.3s"
                >
                    {String(minutes).padStart(2, '0')}
                </Box>
                <Text color="orange.500" fontSize={{ base: "3xl", md: "4xl" }}>🔥</Text>
                <Box
                    px={{ base: "4", md: "5" }}
                    py={{ base: "3", md: "4" }}
                    bgGradient="to-br"
                    gradientFrom="orange.400"
                    gradientTo="red.500"
                    borderRadius="2xl"
                    color="white"
                    minW={{ base: "60px", md: "70px" }}
                    textAlign="center"
                    shadow="xl"
                    transform="rotate(-2deg)"
                    _hover={{ transform: "rotate(0deg) scale(1.05)" }}
                    transition="all 0.3s"
                >
                    {String(seconds).padStart(2, '0')}
                </Box>
            </HStack>
            <HStack gap="8" fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase">
                <Text>Hours</Text>
                <Text>Minutes</Text>
                <Text>Seconds</Text>
            </HStack>
        </VStack>
    );
};

// Pending Burn Token Box Component with playful design
const PendingBurnBox = ({ token, onClick }: { token: typeof mockPendingBurns[0], onClick: () => void }) => {
    return (
        <Box
            p="5"
            bg="bg.panel"
            borderRadius="3xl"
            borderWidth="3px"
            borderColor="orange.400"
            shadow="lg"
            cursor="pointer"
            onClick={onClick}
            _hover={{
                borderColor: "orange.500",
                shadow: "2xl",
                transform: "translateY(-4px) rotate(1deg)",
            }}
            transition="all 0.3s"
            position="relative"
            overflow="hidden"
        >
            {/* Decorative flame emoji */}
            <Text
                position="absolute"
                top="2"
                right="2"
                fontSize="2xl"
                style={{
                    animation: "flicker 2s infinite"
                }}
            >
                🔥
            </Text>

            <VStack gap="3" align="center">
                <Box
                    p="2"
                    bg="orange.50"
                    _dark={{ bg: "orange.950" }}
                    borderRadius="full"
                    width={token.isLP ? "80px" : "auto"}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <TokenLogo
                        logo={token.logo}
                        logo2={token.logo2}
                        isLP={token.isLP}
                        size="56px"
                        alt={token.ticker}
                    />
                </Box>
                <VStack gap="1" align="center">
                    <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                        {token.name}
                    </Text>
                    <Badge colorPalette="orange" size="md" variant="solid" borderRadius="full">
                        {token.ticker}
                    </Badge>
                </VStack>
                <VStack gap="0" align="center" mt="2">
                    <Text fontSize="xs" color="fg.muted" textTransform="uppercase" fontWeight="bold">
                        Ready to Burn
                    </Text>
                    <Text fontSize="2xl" fontWeight="black" color="orange.500">
                        {token.amount}
                    </Text>
                    {token.usdValue && (
                        <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                            ≈ ${token.usdValue}
                        </Text>
                    )}
                </VStack>
            </VStack>
        </Box>
    );
};

export default function BurnerHomePage() {
    // Mock countdown: 2 hours from now
    const mockCountdownSeconds = 7200;

    // Burn modal state
    const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);

    // Router for navigation
    const router = useRouter();

    // Fetch burn history
    const { burnHistory, isLoading: isLoadingHistory } = useBurningHistory();
    const { getAsset, nativeAsset } = useAssets();
    const { totalUsdValue } = useAssetsValue();

    // Get last 10 burns
    const lastBurnings = burnHistory.slice(0, 10);

    // Calculate total BZE burned
    const totalBzeBurned = useMemo(() => {
        if (!nativeAsset) return BigNumber(0);

        const nativeBurns = burnHistory.filter(burn => burn.denom === nativeAsset.denom);
        return nativeBurns.reduce((total, burn) => {
            return total.plus(burn.amount);
        }, BigNumber(0));
    }, [burnHistory, nativeAsset]);

    // Calculate USD value of total BZE burned
    const totalBzeUsdValue = useMemo(() => {
        if (!nativeAsset || totalBzeBurned.isZero()) return BigNumber(0);

        return totalUsdValue([{ denom: nativeAsset.denom, amount: totalBzeBurned }]);
    }, [totalBzeBurned, nativeAsset, totalUsdValue]);

    const handleCoinClick = (denom: string) => {
        router.push(`/coin?coin=${encodeURIComponent(denom)}`);
    };

    return (
        <Box minH="100vh" pb="12">
            {/* Add flicker animation */}
            <style jsx global>{`
                @keyframes flicker {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>

            <Container py={{ base: '6', md: '10' }}>
                <VStack gap="10" align="stretch">
                    {/* Page Header with playful design */}
                    <Box textAlign="center" position="relative">
                        <Text
                            fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                            fontWeight="black"
                            bgGradient="to-r"
                            gradientFrom="orange.400"
                            gradientVia="red.500"
                            gradientTo="orange.400"
                            bgClip="text"
                            mb="3"
                            letterSpacing="tight"
                            style={{
                                animation: "float 3s ease-in-out infinite"
                            }}
                        >
                            🔥 The Burning Pot 🔥
                        </Text>
                        <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted" fontWeight="semibold" mb="4">
                            Toss your tokens into the fire and watch them vanish!
                        </Text>
                        <Button
                            size={{ base: "lg", md: "xl" }}
                            colorPalette="orange"
                            onClick={() => setIsBurnModalOpen(true)}
                            fontWeight="black"
                            fontSize={{ base: "md", md: "lg" }}
                            px="8"
                            py="6"
                            borderRadius="2xl"
                            shadow="xl"
                            _hover={{
                                transform: "scale(1.05)",
                                shadow: "2xl"
                            }}
                            transition="all 0.3s"
                        >
                            🔥 Burn Tokens Now!
                        </Button>
                    </Box>

                    {/* Countdown Section with super playful design */}
                    <Card.Root
                        bgGradient="to-br"
                        gradientFrom="yellow.50"
                        gradientVia="orange.100"
                        gradientTo="red.100"
                        _dark={{
                            gradientFrom: "orange.950",
                            gradientVia: "orange.900",
                            gradientTo: "red.950",
                        }}
                        borderWidth="4px"
                        borderColor="orange.400"
                        borderRadius="3xl"
                        shadow="2xl"
                    >
                        <Card.Body>
                            <VStack gap="5" align="center" py="6">
                                <VStack gap="1">
                                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="black" color="orange.600" _dark={{ color: "orange.400" }} textTransform="uppercase">
                                        🍲 Next Pot Cooking In 🍲
                                    </Text>
                                    <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                                        Get ready... tokens are about to sizzle!
                                    </Text>
                                </VStack>
                                <CountdownTimer targetTime={mockCountdownSeconds} />
                            </VStack>
                        </Card.Body>
                    </Card.Root>

                    {/* Pending Burns Section */}
                    <Box>
                        <HStack justify="space-between" align="center" mb="5">
                            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="black">
                                🎯 Ready to Burn
                            </Text>
                            <Badge colorPalette="orange" size="lg" variant="solid" borderRadius="full">
                                {mockPendingBurns.length} tokens
                            </Badge>
                        </HStack>
                        <Grid
                            templateColumns={{
                                base: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                                lg: "repeat(4, 1fr)",
                            }}
                            gap="5"
                        >
                            {mockPendingBurns.map((token, idx) => (
                                <GridItem key={idx}>
                                    <PendingBurnBox token={token} onClick={() => handleCoinClick(token.denom)} />
                                </GridItem>
                            ))}
                        </Grid>
                    </Box>

                    {/* Total BZE Burned with subtle design */}
                    <Card.Root
                        bgGradient="to-br"
                        gradientFrom="orange.50"
                        gradientTo="orange.100"
                        _dark={{
                            gradientFrom: "orange.950",
                            gradientTo: "orange.900",
                        }}
                        borderWidth="2px"
                        borderColor="orange.300"
                        borderRadius="2xl"
                        shadow="md"
                    >
                        <Card.Body>
                            <VStack gap="2" align="center" py="6">
                                <Text fontSize={{ base: "sm", md: "md" }} fontWeight="semibold" color="orange.600" _dark={{ color: "orange.400" }} textTransform="uppercase">
                                    💰 Total {nativeAsset?.ticker || 'BZE'} Incinerated
                                </Text>
                                {isLoadingHistory ? (
                                    <Text fontSize="md" color="fg.muted">
                                        Loading...
                                    </Text>
                                ) : (
                                    <VStack gap="1" align="center">
                                        <Text fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} fontWeight="black" color="orange.500">
                                            {prettyAmount(totalBzeBurned)}
                                        </Text>
                                        {totalBzeUsdValue.gt(0) && (
                                            <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted" fontWeight="semibold">
                                                ≈ ${prettyAmount(totalBzeUsdValue)}
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

                    <Separator borderColor="orange.200" _dark={{ borderColor: "orange.800" }} />

                    {/* Last 10 Burnings with playful header */}
                    <Box>
                        <HStack justify="space-between" align="center" mb="5">
                            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="black">
                                📜 Burn History Book
                            </Text>
                            <Badge colorPalette="red" size="lg" variant="subtle" borderRadius="full">
                                Last 10 Victims
                            </Badge>
                        </HStack>
                        <Box
                            borderRadius="2xl"
                            borderWidth="3px"
                            borderColor="orange.300"
                            _dark={{ borderColor: "orange.700" }}
                            overflow="hidden"
                            bg="bg.panel"
                            shadow="lg"
                        >
                            {/* Desktop Table View */}
                            <Box display={{ base: "none", md: "block" }} overflowX="auto">
                                <Table.Root size="md" variant="outline">
                                    <Table.Header>
                                        <Table.Row bg="orange.100" _dark={{ bg: "orange.900" }}>
                                            <Table.ColumnHeader fontWeight="black">Token</Table.ColumnHeader>
                                            <Table.ColumnHeader fontWeight="black">Name</Table.ColumnHeader>
                                            <Table.ColumnHeader fontWeight="black">Amount Burned</Table.ColumnHeader>
                                            <Table.ColumnHeader fontWeight="black">Block Height</Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {isLoadingHistory ? (
                                            <Table.Row>
                                                <Table.Cell colSpan={4}>
                                                    <Text textAlign="center" py="8" color="fg.muted">
                                                        Loading burn history...
                                                    </Text>
                                                </Table.Cell>
                                            </Table.Row>
                                        ) : lastBurnings.length === 0 ? (
                                            <Table.Row>
                                                <Table.Cell colSpan={4}>
                                                    <VStack gap="3" align="center" py="8">
                                                        <Text fontSize="4xl">🔍</Text>
                                                        <Text fontSize="lg" fontWeight="bold">
                                                            No Burns Yet
                                                        </Text>
                                                        <Text fontSize="sm" color="fg.muted">
                                                            Be the first to burn some tokens!
                                                        </Text>
                                                    </VStack>
                                                </Table.Cell>
                                            </Table.Row>
                                        ) : (
                                            lastBurnings.map((burn, idx) => {
                                                const asset = getAsset(burn.denom);
                                                const ticker = asset?.ticker || burn.denom;
                                                const name = asset?.name || burn.denom;
                                                const logo = asset?.logo || "/images/token.svg";
                                                const isLP = burn.denom.startsWith("ulp_");
                                                const formattedAmount = prettyAmount(burn.amount);
                                                const formattedUsdValue = prettyAmount(burn.usdValue);

                                                return (
                                                    <Table.Row
                                                        key={idx}
                                                        cursor="pointer"
                                                        onClick={() => handleCoinClick(burn.denom)}
                                                        _hover={{
                                                            bg: "orange.50",
                                                            _dark: { bg: "orange.950" }
                                                        }}
                                                        transition="all 0.2s"
                                                    >
                                                        <Table.Cell>
                                                            <HStack gap="3">
                                                                <Box
                                                                    p="1"
                                                                    bg="orange.50"
                                                                    _dark={{ bg: "orange.950" }}
                                                                    borderRadius="full"
                                                                    width={isLP ? "52px" : "auto"}
                                                                    display="flex"
                                                                    justifyContent="center"
                                                                    alignItems="center"
                                                                >
                                                                    <TokenLogo
                                                                        logo={logo}
                                                                        isLP={isLP}
                                                                        size="32px"
                                                                        alt={ticker}
                                                                    />
                                                                </Box>
                                                                <Text fontWeight="bold" fontSize="md">{ticker}</Text>
                                                            </HStack>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Text fontSize="md" color="fg.muted" fontWeight="medium">
                                                                {name}
                                                            </Text>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <VStack gap="0" align="start">
                                                                <Text fontWeight="black" fontSize="md" color="orange.500">
                                                                    {formattedAmount} {ticker}
                                                                </Text>
                                                                {burn.usdValue.gt(0) && (
                                                                    <Text fontSize="sm" color="fg.muted">
                                                                        ≈ ${formattedUsdValue}
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <VStack gap="1" align="start">
                                                                <Badge colorPalette="gray" variant="subtle" size="md" borderRadius="full">
                                                                    #{burn.blockHeight}
                                                                </Badge>
                                                                <Text fontSize="xs" color="fg.muted">
                                                                    {burn.timestamp}
                                                                </Text>
                                                            </VStack>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                );
                                            })
                                        )}
                                    </Table.Body>
                                </Table.Root>
                            </Box>

                            {/* Mobile Card View */}
                            <Box display={{ base: "block", md: "none" }}>
                                {isLoadingHistory ? (
                                    <Box p="8">
                                        <Text textAlign="center" color="fg.muted">
                                            Loading burn history...
                                        </Text>
                                    </Box>
                                ) : lastBurnings.length === 0 ? (
                                    <VStack gap="3" align="center" py="8">
                                        <Text fontSize="4xl">🔍</Text>
                                        <Text fontSize="lg" fontWeight="bold">
                                            No Burns Yet
                                        </Text>
                                        <Text fontSize="sm" color="fg.muted">
                                            Be the first to burn some tokens!
                                        </Text>
                                    </VStack>
                                ) : (
                                    <VStack gap="0" align="stretch">
                                        {lastBurnings.map((burn, idx) => {
                                            const asset = getAsset(burn.denom);
                                            const ticker = asset?.ticker || burn.denom;
                                            const name = asset?.name || burn.denom;
                                            const logo = asset?.logo || "/images/token.svg";
                                            const isLP = burn.denom.startsWith("ulp_");
                                            const formattedAmount = prettyAmount(burn.amount);
                                            const formattedUsdValue = prettyAmount(burn.usdValue);

                                            return (
                                                <Box
                                                    key={idx}
                                                    p="4"
                                                    cursor="pointer"
                                                    onClick={() => handleCoinClick(burn.denom)}
                                                    borderBottomWidth={idx < lastBurnings.length - 1 ? "2px" : "0"}
                                                    borderColor="orange.200"
                                                    _dark={{ borderColor: "orange.800" }}
                                                    _hover={{
                                                        bg: "orange.50",
                                                        _dark: { bg: "orange.950" }
                                                    }}
                                                >
                                                    <HStack justify="space-between" mb="2">
                                                        <HStack gap="3">
                                                            <Box
                                                                p="1"
                                                                bg="orange.50"
                                                                _dark={{ bg: "orange.950" }}
                                                                borderRadius="full"
                                                                width={isLP ? "56px" : "auto"}
                                                                display="flex"
                                                                justifyContent="center"
                                                                alignItems="center"
                                                            >
                                                                <TokenLogo
                                                                    logo={logo}
                                                                    isLP={isLP}
                                                                    size="40px"
                                                                    alt={ticker}
                                                                />
                                                            </Box>
                                                            <VStack gap="0" align="start">
                                                                <Text fontWeight="bold" fontSize="md">
                                                                    {ticker}
                                                                </Text>
                                                                <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                                                                    {name}
                                                                </Text>
                                                            </VStack>
                                                        </HStack>
                                                        <VStack gap="0" align="end">
                                                            <Text fontWeight="black" color="orange.500" fontSize="md">
                                                                {formattedAmount}
                                                            </Text>
                                                            {burn.usdValue.gt(0) && (
                                                                <Text fontSize="xs" color="fg.muted">
                                                                    ≈ ${formattedUsdValue}
                                                                </Text>
                                                            )}
                                                            <Badge colorPalette="gray" variant="subtle" size="sm" borderRadius="full" mt="1">
                                                                #{burn.blockHeight}
                                                            </Badge>
                                                            <Text fontSize="xs" color="fg.muted" mt="1">
                                                                {burn.timestamp}
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                </Box>
                                            );
                                        })}
                                    </VStack>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Fun footer message */}
                    <Box textAlign="center" py="4">
                        <Text fontSize="sm" color="fg.muted" fontStyle="italic">
                            Remember: What burns in the pot, stays in the pot! 🔥✨
                        </Text>
                    </Box>
                </VStack>
            </Container>

            {/* Burn Modal */}
            <BurnModal
                isOpen={isBurnModalOpen}
                onClose={() => setIsBurnModalOpen(false)}
            />
        </Box>
    );
}
