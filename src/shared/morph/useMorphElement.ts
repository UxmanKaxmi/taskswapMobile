import { useCallback, useEffect, useRef } from 'react';
import type React from 'react';
import type { View } from 'react-native';
import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { MORPH_NODE_STYLE, useMorph, type MorphRect, type MorphStyle } from './MorphProvider';

function measureInWindow(node: View | null): Promise<MorphRect | null> {
  return new Promise(resolve => {
    if (!node?.measureInWindow) {
      resolve(null);
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      if (!width || !height) resolve(null);
      else resolve({ x, y, width, height });
    });
  });
}

type SourcePart =
  // A text element: flies as text on a morphing surface (font cross-scales).
  // `sourceNode` optionally replaces the source-look text layer with a
  // composite snapshot (e.g. a button with label + icon).
  | { text: string; style: MorphStyle; sourceNode?: React.ReactNode; node?: undefined }
  // A node element: flies the given snapshot node, uniformly scaled.
  | { node: React.ReactNode; text?: undefined; style?: undefined; sourceNode?: undefined };

// Attach a ref to each source view via setRef('key'). Call start() right
// before navigating (await it — measurement takes a frame); it measures every
// registered part and launches the overlay. While a morph for `id` is active,
// hide the real source views (activeId === id) so the clone isn't doubled.
export function useMorphSource() {
  const refs = useRef<Record<string, View | null>>({});
  const { beginMorph, activeId, flyingId } = useMorph();

  const setRef = useCallback(
    (key: string) => (node: View | null) => {
      refs.current[key] = node;
    },
    [],
  );

  const start = useCallback(
    async (id: string, parts: Record<string, SourcePart>): Promise<boolean> => {
      const measured = await Promise.all(
        Object.entries(parts).map(async ([key, part]) => {
          const rect = await measureInWindow(refs.current[key]);
          if (!rect) return null;
          return part.node
            ? { key, text: '', node: part.node, source: { ...rect, ...MORPH_NODE_STYLE } }
            : {
                key,
                text: part.text,
                sourceNode: part.sourceNode,
                source: { ...rect, ...part.style },
              };
        }),
      );
      const elements = measured.filter((el): el is NonNullable<typeof el> => el !== null);
      if (!elements.length) return false;
      beginMorph({ id, elements });
      return true;
    },
    [beginMorph],
  );

  // Hide the real source views on `flyingId` (clones actually moving), NOT on
  // `activeId` (measured but destination not ready) — hiding at tap causes a
  // visible flicker before anything moves.
  return { setRef, start, activeId, flyingId };
}

type MorphTargetOptions = {
  // Destination wording when it differs from the source text.
  text?: string;
};

// Attach ref/onLayout to the destination view and spread animatedStyle onto it.
// It registers this element's target rect once laid out (only while a matching
// morph is in flight) and crossfades the real element in as the clone lands.
export function useMorphTarget(
  id: string,
  key: string,
  style: MorphStyle,
  options?: MorphTargetOptions,
) {
  const ref = useRef<View>(null);
  const registered = useRef(false);
  const { setTarget, activeId, progress } = useMorph();
  const isActive = activeId === id && id !== '';

  const styleRef = useRef(style);
  styleRef.current = style;
  const textRef = useRef(options?.text);
  textRef.current = options?.text;

  const tryRegister = useCallback(() => {
    if (!isActive || registered.current) return;
    // Defer a tick so final layout (fonts, wrapping) has settled before measuring.
    setTimeout(() => {
      void measureInWindow(ref.current).then(rect => {
        if (!rect || registered.current) return;
        registered.current = true;
        setTarget(id, key, { ...rect, ...styleRef.current }, textRef.current);
      });
    }, 0);
  }, [isActive, id, key, setTarget]);

  // Two registration paths cover both orderings:
  // - onLayout fires after beginMorph (normal): registers there.
  // - this screen laid out BEFORE beginMorph landed (fast mounts): the
  //   isActive flip re-triggers registration here.
  useEffect(() => {
    if (isActive) {
      tryRegister();
    } else {
      registered.current = false;
    }
  }, [isActive, tryRegister]);

  const onLayout = useCallback(() => {
    tryRegister();
  }, [tryRegister]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!isActive) return { opacity: 1 };
    return { opacity: interpolate(progress.value, [0, 0.75, 1], [0, 0, 1]) };
  }, [isActive]);

  return { ref, onLayout, animatedStyle, isActive };
}

// For destination content that has NO counterpart on the source screen (stats,
// sections, etc.): keeps it invisible while the shared elements fly, then
// fades/slides it in as the morph lands. `index` staggers successive blocks.
export function useMorphStagedReveal(id: string, index = 0) {
  const { activeId, progress } = useMorph();
  const isActive = activeId === id && id !== '';
  const startP = Math.min(0.5 + index * 0.12, 0.8);

  return useAnimatedStyle(() => {
    if (!isActive) {
      return { opacity: 1, transform: [{ translateY: 0 }] as const };
    }
    return {
      opacity: interpolate(progress.value, [startP, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(progress.value, [startP, 1], [14, 0], Extrapolation.CLAMP),
        },
      ] as const,
    };
  }, [isActive, startP]);
}
