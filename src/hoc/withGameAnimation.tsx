import React, { ComponentType, FC, memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '../utils';

/**
 * Supported animation modes for the Gem Duel interface
 */
export type AnimationMode =
    | 'fade'
    | 'slide-up'
    | 'scale'
    | 'bounce'
    | 'acquire'
    | 'flip'
    | 'prestige';

/**
 * Configuration for the animation behavior
 */
export interface AnimationConfig {
    mode?: AnimationMode;
    delay?: number;
    duration?: number;
    hoverScale?: number;
    tapScale?: number;
    className?: string;
    layout?: boolean;
    targetX?: number;
    targetY?: number;
}

/**
 * Props added to the wrapped component by the HOC
 */
export interface WithAnimationProps {
    animationConfig?: AnimationConfig;
}

/**
 * Animation variants defining the actual Framer Motion behavior
 */
const presets: Record<AnimationMode, Variants> = {
    fade: {
        initial: { opacity: 0 },
        animate: (custom: AnimationConfig) => ({
            opacity: 1,
            transition: { duration: custom.duration ?? 0.3, delay: custom.delay ?? 0 },
        }),
        exit: (custom: AnimationConfig) => ({
            opacity: 0,
            transition: { duration: custom.duration ?? 0.3, delay: 0 },
        }),
    },
    'slide-up': {
        initial: { opacity: 0, y: 20 },
        animate: (custom: AnimationConfig) => ({
            opacity: 1,
            y: 0,
            transition: { duration: custom.duration ?? 0.3, delay: custom.delay ?? 0 },
        }),
        exit: (custom: AnimationConfig) => ({
            opacity: 0,
            y: -20,
            transition: { duration: custom.duration ?? 0.3, delay: 0 },
        }),
    },
    scale: {
        initial: { opacity: 0, scale: 0.8 },
        animate: (custom: AnimationConfig) => ({
            opacity: 1,
            scale: 1,
            transition: { duration: custom.duration ?? 0.3, delay: custom.delay ?? 0 },
        }),
        exit: (custom: AnimationConfig) => ({
            opacity: 0,
            scale: 0.8,
            transition: { duration: custom.duration ?? 0.3, delay: 0 },
        }),
    },
    bounce: {
        initial: { scale: 0.5, opacity: 0 },
        animate: (custom: AnimationConfig) => ({
            scale: 1,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 15,
                delay: custom.delay ?? 0,
            },
        }),
        exit: () => ({
            scale: 0.5,
            opacity: 0,
            transition: { duration: 0.2, delay: 0 },
        }),
    },
    acquire: {
        initial: { opacity: 0, scale: 0.5, x: -100 },
        animate: { opacity: 1, scale: 1, x: 0, zIndex: 1 },
        exit: (custom: AnimationConfig) => ({
            opacity: 0,
            scale: 0.3,
            x: custom.targetX ?? 0,
            y: custom.targetY ?? 400,
            rotate: 15,
            zIndex: 1000,
            transition: { duration: 0.8, ease: [0.32, 0, 0.67, 0] },
        }),
    },
    prestige: {
        initial: { opacity: 0, scale: 0.5, x: -100 },
        animate: { opacity: 1, scale: 1, x: 0 },
        exit: (custom: AnimationConfig) => ({
            opacity: [1, 1, 0],
            scale: [1, 0.5, 0.1],
            x: custom.targetX ?? 300,
            y: custom.targetY ?? -400,
            filter: ['brightness(1)', 'brightness(2)', 'brightness(5)'],
            rotate: 360,
            zIndex: 1000,
            transition: { duration: 1, ease: 'easeIn' },
        }),
    },
    flip: {
        initial: { rotateY: 90, opacity: 0, scale: 0.8 },
        animate: {
            rotateY: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
        exit: { rotateY: -90, opacity: 0, scale: 0.8 },
    },
};

/**
 * withGameAnimation HOC
 *
 * A reusable Higher-Order Component that injects Framer Motion capabilities
 * into any game component while preserving full TypeScript type safety.
 */
export function withGameAnimation<P extends object>(
    WrappedComponent: ComponentType<P>
): FC<P & WithAnimationProps> {
    const ComponentWithAnimation: FC<P & WithAnimationProps> = (props) => {
        const { animationConfig, ...componentProps } = props;

        const config = animationConfig ?? {};
        const mode = config.mode ?? 'fade';
        const hoverScale = config.hoverScale ?? 1.05;
        const tapScale = config.tapScale ?? 0.95;
        const className = config.className ?? '';
        const layout = config.layout ?? true;

        const variant = presets[mode];

        return (
            <motion.div
                layout={layout}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={config}
                whileHover={hoverScale !== 1 ? { scale: hoverScale } : undefined}
                whileTap={tapScale !== 1 ? { scale: tapScale } : undefined}
                variants={variant}
                className={cn('inline-block', className)}
            >
                <WrappedComponent {...(componentProps as P)} />
            </motion.div>
        );
    };

    ComponentWithAnimation.displayName = `WithGameAnimation(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return memo(ComponentWithAnimation) as unknown as FC<P & WithAnimationProps>;
}
