"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        // Check if splash has already been shown in this session
        const splashShown = sessionStorage.getItem("splashShown");

        if (splashShown) {
            setIsVisible(false);
            setHasShown(true);
            return;
        }

        // Auto-hide after animation completes (1.2s)
        const timer = setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem("splashShown", "true");
            setHasShown(true);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    // Allow user to skip by clicking
    const handleSkip = () => {
        setIsVisible(false);
        sessionStorage.setItem("splashShown", "true");
        setHasShown(true);
    };

    if (hasShown && !isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleSkip}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-background-dark cursor-pointer"
                >
                    {/* Logo container with animations */}
                    <div className="relative flex flex-col items-center">
                        {/* Main Logo with fade-in and scale */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="relative z-10"
                        >
                            <Logo textSize="text-4xl" />

                            {/* Scan line effect on logo */}
                            <motion.div
                                initial={{ top: 0, opacity: 0 }}
                                animate={{
                                    top: "100%",
                                    opacity: [0, 1, 1, 0],
                                }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.3,
                                    ease: "linear",
                                }}
                                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
                                style={{
                                    boxShadow: "0 0 20px rgba(19, 236, 91, 0.8), 0 0 40px rgba(19, 236, 91, 0.4)",
                                }}
                            />

                            {/* Additional scan lines for depth */}
                            <motion.div
                                initial={{ top: 0, opacity: 0 }}
                                animate={{
                                    top: "100%",
                                    opacity: [0, 0.5, 0.5, 0],
                                }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.35,
                                    ease: "linear",
                                }}
                                className="absolute left-0 right-0 h-[1px] bg-primary/30"
                            />

                            <motion.div
                                initial={{ top: 0, opacity: 0 }}
                                animate={{
                                    top: "100%",
                                    opacity: [0, 0.3, 0.3, 0],
                                }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.4,
                                    ease: "linear",
                                }}
                                className="absolute left-0 right-0 h-[1px] bg-primary/20"
                            />
                        </motion.div>

                        {/* Reflection effect */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                            className="relative mt-2"
                            style={{
                                transform: "scaleY(-1)",
                                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 70%)",
                                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 70%)",
                            }}
                        >
                            <div className="opacity-30 blur-[1px]">
                                <Logo textSize="text-4xl" />
                            </div>

                            {/* Scan line effect on reflection - synchronized */}
                            <motion.div
                                initial={{ top: 0, opacity: 0 }}
                                animate={{
                                    top: "100%",
                                    opacity: [0, 0.6, 0.6, 0],
                                }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.3,
                                    ease: "linear",
                                }}
                                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
                                style={{
                                    boxShadow: "0 0 15px rgba(19, 236, 91, 0.5)",
                                }}
                            />
                        </motion.div>
                    </div>

                    {/* Skip hint (subtle) */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 0.5 }}
                        className="absolute bottom-8 text-xs text-muted"
                    >
                        Click anywhere to skip
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
