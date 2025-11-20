'use client';

import {
    Box,
    Button,
    createListCollection,
    Field,
    HStack,
    Image,
    Input,
    Portal,
    Select,
    Text,
    VStack,
    Dialog,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";

// Mock wallet tokens (this will be replaced with real data later)
const mockWalletTokens = [
    { denom: "ubze", name: "BeeZee", ticker: "BZE", balance: "10,000.00", logo: "/images/token.svg" },
    { denom: "uatom", name: "Cosmos", ticker: "ATOM", balance: "5,000.00", logo: "/images/token.svg" },
    { denom: "uosmo", name: "Osmosis", ticker: "OSMO", balance: "8,500.00", logo: "/images/token.svg" },
    { denom: "ujuno", name: "Juno", ticker: "JUNO", balance: "2,300.00", logo: "/images/token.svg" },
];

interface BurnModalProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedCoin?: string; // denom of preselected coin
}

export const BurnModal = ({ isOpen, onClose, preselectedCoin }: BurnModalProps) => {
    const [selectedCoin, setSelectedCoin] = useState<string>(preselectedCoin || "");
    const [amount, setAmount] = useState("");
    const [amountError, setAmountError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (preselectedCoin) {
                setSelectedCoin(preselectedCoin);
            } else {
                setSelectedCoin("");
            }
            setAmount("");
            setAmountError("");
        }
    }, [isOpen, preselectedCoin]);

    // Create collection for select
    const tokensCollection = createListCollection({
        items: mockWalletTokens.map(token => ({
            label: `${token.ticker} - ${token.balance}`,
            value: token.denom,
            logo: token.logo,
            balance: token.balance,
        }))
    });

    const selectedTokenData = useMemo(() => {
        return mockWalletTokens.find(t => t.denom === selectedCoin);
    }, [selectedCoin]);

    const handleAmountChange = (value: string) => {
        // Allow only numbers and decimals
        const sanitized = value.replace(/[^0-9.]/g, '');
        setAmount(sanitized);
        setAmountError("");
    };

    const handleMaxClick = () => {
        if (selectedTokenData) {
            setAmount(selectedTokenData.balance.replace(/,/g, ''));
        }
    };

    const handleBurn = () => {
        // Validation
        if (!selectedCoin) {
            setAmountError("Please select a token to burn");
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setAmountError("Please enter a valid amount");
            return;
        }

        if (selectedTokenData) {
            const balance = parseFloat(selectedTokenData.balance.replace(/,/g, ''));
            const burnAmount = parseFloat(amount);

            if (burnAmount > balance) {
                setAmountError("Not enough balance!");
                return;
            }
        }

        // Mock submission
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
            // Here you would trigger the actual burn transaction
            console.log("Burning:", amount, selectedCoin);
        }, 2000);
    };

    const isFormValid = selectedCoin && amount && parseFloat(amount) > 0 && !amountError;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !isSubmitting && e.open === false && onClose()}>
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
                                🔥 Burn Your Tokens 🔥
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <VStack gap="5" align="stretch">
                                {/* Warning Box */}
                                <Box
                                    p="4"
                                    bg="red.50"
                                    _dark={{
                                        bg: "gray.800",
                                        borderColor: "orange.500"
                                    }}
                                    borderRadius="xl"
                                    borderWidth="2px"
                                    borderColor="red.300"
                                >
                                    <VStack gap="2" align="center">
                                        <Text fontSize="3xl">⚠️</Text>
                                        <Text fontSize="sm" fontWeight="bold" textAlign="center" color="red.700" _dark={{ color: "orange.300" }}>
                                            Warning: No Take-Backs!
                                        </Text>
                                        <Text fontSize="xs" textAlign="center" color="red.800" _dark={{ color: "gray.200" }}>
                                            Once you burn your tokens, they&apos;re gone forever! Like throwing money into a volcano. Make sure you really want to do this!
                                        </Text>
                                    </VStack>
                                </Box>

                                {/* Coin Selection (if not preselected) */}
                                {!preselectedCoin && (
                                    <Box>
                                        <Field.Root>
                                            <Field.Label fontWeight="semibold">Select Token to Burn</Field.Label>
                                            <Select.Root
                                                collection={tokensCollection}
                                                size="md"
                                                value={selectedCoin ? [selectedCoin] : []}
                                                onValueChange={(details) => setSelectedCoin(details.value[0] || '')}
                                            >
                                                <Select.Control>
                                                    <Select.Trigger>
                                                        <Select.ValueText placeholder="Choose a token..." />
                                                    </Select.Trigger>
                                                </Select.Control>
                                                <Select.Positioner>
                                                    <Select.Content>
                                                        {tokensCollection.items.map((item) => (
                                                            <Select.Item key={item.value} item={item}>
                                                                <Select.ItemText>
                                                                    <HStack gap="2">
                                                                        <Image
                                                                            src={item.logo}
                                                                            alt={item.value}
                                                                            width="20px"
                                                                            height="20px"
                                                                            borderRadius="full"
                                                                        />
                                                                        <Text>{item.label}</Text>
                                                                    </HStack>
                                                                </Select.ItemText>
                                                                <Select.ItemIndicator />
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Select.Root>
                                        </Field.Root>
                                    </Box>
                                )}

                                {/* Show selected token info if preselected */}
                                {preselectedCoin && selectedTokenData && (
                                    <Box
                                        p="3"
                                        bg="orange.50"
                                        _dark={{ bg: "orange.950" }}
                                        borderRadius="lg"
                                    >
                                        <HStack gap="3">
                                            <Image
                                                src={selectedTokenData.logo}
                                                alt={selectedTokenData.ticker}
                                                width="32px"
                                                height="32px"
                                                borderRadius="full"
                                            />
                                            <VStack gap="0" align="start">
                                                <Text fontWeight="bold">{selectedTokenData.ticker}</Text>
                                                <Text fontSize="sm" color="fg.muted">
                                                    Balance: {selectedTokenData.balance}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Box>
                                )}

                                {/* Available Balance (if token selected) */}
                                {selectedTokenData && !preselectedCoin && (
                                    <Box
                                        p="3"
                                        bg="orange.50"
                                        _dark={{
                                            bg: "gray.800",
                                            borderColor: "orange.500"
                                        }}
                                        borderRadius="lg"
                                        borderWidth="1px"
                                        borderColor="orange.300"
                                    >
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" fontWeight="medium">
                                                Available Balance:
                                            </Text>
                                            <Text fontSize="sm" fontWeight="bold" color="orange.500" _dark={{ color: "orange.300" }}>
                                                {selectedTokenData.balance} {selectedTokenData.ticker}
                                            </Text>
                                        </HStack>
                                    </Box>
                                )}

                                {/* Amount Input */}
                                <Box>
                                    <Field.Root invalid={!!amountError}>
                                        <Field.Label fontWeight="semibold">Amount to Burn</Field.Label>
                                        <HStack gap="2">
                                            <Input
                                                size="lg"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => handleAmountChange(e.target.value)}
                                                disabled={!selectedCoin || isSubmitting}
                                            />
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                colorPalette="orange"
                                                onClick={handleMaxClick}
                                                disabled={!selectedCoin || isSubmitting}
                                            >
                                                MAX
                                            </Button>
                                        </HStack>
                                        {amountError && <Field.ErrorText>{amountError}</Field.ErrorText>}
                                    </Field.Root>
                                </Box>

                                {/* Confirmation Preview */}
                                {isFormValid && selectedTokenData && (
                                    <Box
                                        p="4"
                                        bg="bg.muted"
                                        borderRadius="lg"
                                        borderWidth="2px"
                                        borderColor="orange.200"
                                        _dark={{ borderColor: "orange.800" }}
                                    >
                                        <VStack gap="2" align="stretch">
                                            <Text fontSize="sm" fontWeight="bold" textAlign="center">
                                                You&apos;re about to burn:
                                            </Text>
                                            <HStack justify="center" gap="2">
                                                <Text fontSize="2xl" fontWeight="black" color="orange.500">
                                                    {amount}
                                                </Text>
                                                <Text fontSize="2xl" fontWeight="black">
                                                    {selectedTokenData.ticker}
                                                </Text>
                                            </HStack>
                                            <Text fontSize="xs" textAlign="center" color="fg.muted" fontStyle="italic">
                                                Into the fire it goes! 🔥
                                            </Text>
                                        </VStack>
                                    </Box>
                                )}
                            </VStack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <HStack gap="3" width="full">
                                <Button
                                    flex="1"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    flex="1"
                                    colorPalette="orange"
                                    onClick={handleBurn}
                                    disabled={!isFormValid || isSubmitting}
                                    loading={isSubmitting}
                                    loadingText="Burning..."
                                >
                                    🔥 Burn It!
                                </Button>
                            </HStack>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger disabled={isSubmitting} />
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
