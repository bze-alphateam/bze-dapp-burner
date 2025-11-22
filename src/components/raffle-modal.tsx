'use client';

import {
    Box,
    Button,
    Field,
    HStack,
    Input,
    Portal,
    Text,
    VStack,
    Dialog,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

interface RaffleModalProps {
    isOpen: boolean;
    onClose: () => void;
    raffleName: string;
    contributionPrice: string;
    currentPrize: string;
    winChance: string; // e.g., "1 in 10"
    ticker: string;
}

export const RaffleModal = ({
    isOpen,
    onClose,
    raffleName,
    contributionPrice,
    currentPrize,
    winChance,
    ticker,
}: RaffleModalProps) => {
    const [numContributions, setNumContributions] = useState("1");
    const [isSpinning, setIsSpinning] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [didWin, setDidWin] = useState(false);
    const [wonAmount, setWonAmount] = useState("0");

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setNumContributions("1");
            setIsSpinning(false);
            setShowResult(false);
            setDidWin(false);
            setWonAmount("0");
        }
    }, [isOpen]);

    const handleBuyContributions = () => {
        setIsSpinning(true);

        // Simulate spinning for 3 seconds
        setTimeout(() => {
            setIsSpinning(false);

            // Mock result - 30% chance to win for demo purposes
            const won = Math.random() < 0.3;
            setDidWin(won);

            if (won) {
                // Calculate won amount (mock calculation)
                const contributions = parseInt(numContributions) || 1;
                const mockWonAmount = (parseFloat(currentPrize.replace(/,/g, '')) * 0.1 * contributions).toFixed(2);
                setWonAmount(mockWonAmount);
            }

            setShowResult(true);
        }, 3000);
    };

    const handlePlayAgain = () => {
        setShowResult(false);
        setNumContributions("1");
    };

    const handleClose = () => {
        if (!isSpinning) {
            onClose();
        }
    };

    const totalCost = (parseFloat(contributionPrice) * (parseInt(numContributions) || 1)).toFixed(2);

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
                                🔥 {raffleName}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <VStack gap="5" align="stretch">
                                {!showResult ? (
                                    <>
                                        {/* Prize Display */}
                                        <Box
                                            p="5"
                                            bgGradient="to-br"
                                            gradientFrom="yellow.100"
                                            gradientTo="orange.100"
                                            _dark={{
                                                gradientFrom: "yellow.900/30",
                                                gradientTo: "orange.900/30",
                                            }}
                                            borderRadius="xl"
                                            borderWidth="2px"
                                            borderColor="orange.400"
                                            textAlign="center"
                                        >
                                            <VStack gap="2">
                                                <Text fontSize="sm" fontWeight="bold" color="orange.600" _dark={{ color: "orange.400" }}>
                                                    🏆 Current Prize
                                                </Text>
                                                <Text fontSize="3xl" fontWeight="black" color="orange.500">
                                                    {currentPrize} {ticker}
                                                </Text>
                                                <Text fontSize="xs" color="fg.muted">
                                                    Your chance: {winChance}
                                                </Text>
                                            </VStack>
                                        </Box>

                                        {/* Spinning Wheel or Contribution Selection */}
                                        {!isSpinning ? (
                                            <>
                                                {/* Number of Contributions */}
                                                <Box>
                                                    <Field.Root>
                                                        <Field.Label fontWeight="semibold">Number of Contributions</Field.Label>
                                                        <Input
                                                            size="lg"
                                                            type="number"
                                                            min="1"
                                                            value={numContributions}
                                                            onChange={(e) => setNumContributions(e.target.value)}
                                                            placeholder="1"
                                                        />
                                                        <Field.HelperText fontSize="xs" color="fg.muted">
                                                            {contributionPrice} {ticker} per contribution
                                                        </Field.HelperText>
                                                    </Field.Root>
                                                </Box>

                                                {/* Total Cost */}
                                                <Box
                                                    p="3"
                                                    bg="orange.50"
                                                    _dark={{ bg: "gray.800", borderColor: "orange.500" }}
                                                    borderRadius="lg"
                                                    borderWidth="1px"
                                                    borderColor="orange.300"
                                                >
                                                    <HStack justify="space-between">
                                                        <Text fontSize="sm" fontWeight="medium">
                                                            Total Cost:
                                                        </Text>
                                                        <Text fontSize="lg" fontWeight="bold" color="orange.500">
                                                            {totalCost} {ticker}
                                                        </Text>
                                                    </HStack>
                                                </Box>

                                                {/* Warning */}
                                                <Box
                                                    p="3"
                                                    bg="yellow.50"
                                                    _dark={{ bg: "gray.800", borderColor: "yellow.500" }}
                                                    borderRadius="lg"
                                                    borderWidth="1px"
                                                    borderColor="yellow.300"
                                                >
                                                    <HStack gap="2">
                                                        <Text fontSize="lg">⚠️</Text>
                                                        <Text fontSize="xs" color="fg.muted">
                                                            Remember: More contributions increase your chances, but don&apos;t guarantee you&apos;ll win!
                                                        </Text>
                                                    </HStack>
                                                </Box>

                                                {/* Buy Button */}
                                                <Button
                                                    size="lg"
                                                    colorPalette="orange"
                                                    onClick={handleBuyContributions}
                                                    fontWeight="black"
                                                >
                                                    💰 Make Contribution & Spin!
                                                </Button>
                                            </>
                                        ) : (
                                            /* Blockchain Processing Animation */
                                            <Box py="8" textAlign="center">
                                                <VStack gap="4">
                                                    <HStack gap="2" justify="center">
                                                        <Box
                                                            fontSize="4xl"
                                                            style={{
                                                                animation: "pulse 1s ease-in-out infinite"
                                                            }}
                                                        >
                                                            🔥
                                                        </Box>
                                                        <Box
                                                            fontSize="4xl"
                                                            style={{
                                                                animation: "pulse 1s ease-in-out 0.2s infinite"
                                                            }}
                                                        >
                                                            🔥
                                                        </Box>
                                                        <Box
                                                            fontSize="4xl"
                                                            style={{
                                                                animation: "pulse 1s ease-in-out 0.4s infinite"
                                                            }}
                                                        >
                                                            🔥
                                                        </Box>
                                                    </HStack>
                                                    <Text fontSize="xl" fontWeight="bold">
                                                        Blockchain is deciding...
                                                    </Text>
                                                    <Text fontSize="sm" color="fg.muted">
                                                        Your contribution is burning! 🔥
                                                    </Text>
                                                </VStack>
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    /* Result Display */
                                    <Box py="6" textAlign="center">
                                        <VStack gap="4">
                                            {didWin ? (
                                                <>
                                                    <Box fontSize="6xl">🎉</Box>
                                                    <Text fontSize="2xl" fontWeight="black" color="green.500">
                                                        YOU WON!
                                                    </Text>
                                                    <Box
                                                        p="4"
                                                        bg="green.50"
                                                        _dark={{ bg: "green.900/30" }}
                                                        borderRadius="xl"
                                                        borderWidth="2px"
                                                        borderColor="green.400"
                                                    >
                                                        <VStack gap="1">
                                                            <Text fontSize="sm" color="fg.muted">
                                                                You won
                                                            </Text>
                                                            <Text fontSize="3xl" fontWeight="black" color="green.500">
                                                                {wonAmount} {ticker}
                                                            </Text>
                                                        </VStack>
                                                    </Box>
                                                    <Text fontSize="sm" color="fg.muted">
                                                        Congratulations! 🎊
                                                    </Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Box fontSize="6xl">🔥</Box>
                                                    <Text fontSize="2xl" fontWeight="black" color="orange.500">
                                                        Not This Time!
                                                    </Text>
                                                    <Text fontSize="sm" color="fg.muted" maxW="300px">
                                                        Your contribution helped reduce supply! Try again for another chance to win.
                                                    </Text>
                                                </>
                                            )}

                                            <HStack gap="3" mt="4">
                                                <Button
                                                    colorPalette="orange"
                                                    onClick={handlePlayAgain}
                                                >
                                                    🔥 Contribute Again
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={onClose}
                                                >
                                                    Close
                                                </Button>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                )}
                            </VStack>
                        </Dialog.Body>

                        <Dialog.CloseTrigger disabled={isSpinning} />

                        {/* Add spinning animation */}
                        <style jsx global>{`
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
