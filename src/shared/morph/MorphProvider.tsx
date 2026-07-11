import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

// A shared-element ("hero") morph done with an app-level overlay, so it works
// even when the source lives inside a tab navigator — where Reanimated's native
// sharedTransitionTag explicitly does nothing. A single morph can carry several
// elements (e.g. the goal text AND the push button), all on one timeline:
//   1. The source measures each part and calls beginMorph() before navigating.
//      From that moment the overlay shows a clone held at the source rect
//      (the real source hides), so there is no dead gap during navigation.
//   2. The destination measures its matching parts and calls setTarget(key).
//   3. progress animates 0 -> 1, flying each clone to its target; the real
//      destination elements crossfade in and the overlay clears.
//
// Performance: clones are laid out ONCE at the destination geometry and
// animated purely with transforms (translate/scale) + paint props (color,
// radius, opacity). Nothing re-layouts per frame — animating fontSize/width/
// height would re-wrap text every frame and stutter.

export type MorphRect = { x: number; y: number; width: number; height: number };

export type MorphStyle = {
  borderRadius: number;
  backgroundColor: string;
  fontSize: number;
  textColor: string;
  paddingHorizontal: number;
  paddingVertical: number;
  align?: 'flex-start' | 'center';
  // The element's REAL resolved text style (font family, lineHeight, spacing —
  // e.g. via resolveAppTextStyle). Applied last on the clone text so the clone
  // is pixel-identical to the element it replaces; without it the clone falls
  // back to the system font and visibly reflows at the swap. Keep fontSize
  // consistent with the `fontSize` field, which drives the scale math.
  textStyle?: TextStyle;
  // Ease the surface in over the first 12% of flight. Use when the surface
  // color matches the backdrop it lifts from (e.g. card-on-card text), so its
  // inflated rect doesn't pop over neighbors. Leave off when the surface IS
  // the visible element (e.g. a colored button) — fading it in while the real
  // element hides would flash a hole.
  surfaceFadeIn?: boolean;
};

export type MorphFrame = MorphRect & MorphStyle;

type MorphElement = {
  key: string;
  text: string;
  source: MorphFrame;
  target: MorphFrame | null;
  // Destination wording when it differs from the source (e.g. "Push" on the
  // card becomes "Push Sara" on the detail CTA).
  targetText?: string;
  // When set, the clone renders this node (uniformly scaled) instead of the
  // text+surface pair — used for non-text elements like the author header.
  node?: React.ReactNode;
  // Text-mode only: render this node as the SOURCE-look layer instead of plain
  // text — for composite sources like a button with label + icon.
  sourceNode?: React.ReactNode;
};

// Placeholder style for node/measure-only frames where the text-styling
// fields are irrelevant.
export const MORPH_NODE_STYLE: MorphStyle = {
  borderRadius: 0,
  backgroundColor: 'transparent',
  fontSize: 1,
  textColor: 'transparent',
  paddingHorizontal: 0,
  paddingVertical: 0,
  align: 'flex-start',
};

type MorphSnapshot = { id: string; elements: MorphElement[] };

type MorphContextValue = {
  beginMorph: (arg: {
    id: string;
    elements: Array<{
      key: string;
      text: string;
      source: MorphFrame;
      node?: React.ReactNode;
      sourceNode?: React.ReactNode;
    }>;
  }) => void;
  setTarget: (id: string, key: string, target: MorphFrame, targetText?: string) => void;
  cancelMorph: () => void;
  activeId: string | null;
  // Set once the first destination registers and the clones actually take off.
  // Sources stay fully visible until then — hiding them at tap caused a
  // visible flicker (font swap, async avatar decode) before anything moved.
  flyingId: string | null;
  progress: SharedValue<number>;
};

const MORPH_DURATION_MS = 400;
// If no destination registers by now, abandon the morph so the real UI recovers.
const FAILSAFE_TIMEOUT_MS = 900;

const MorphContext = createContext<MorphContextValue | null>(null);

export function useMorph() {
  const ctx = useContext(MorphContext);
  if (!ctx) {
    throw new Error('useMorph must be used within a MorphProvider');
  }
  return ctx;
}

export function MorphProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<MorphSnapshot | null>(null);
  const [flyingId, setFlyingId] = useState<string | null>(null);
  const progress = useSharedValue(0);
  const activeIdRef = useRef<string | null>(null);
  const startedRef = useRef(false);
  const failsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (failsafeRef.current) {
      clearTimeout(failsafeRef.current);
      failsafeRef.current = null;
    }
    startedRef.current = false;
    activeIdRef.current = null;
    setSnapshot(null);
    setFlyingId(null);
  }, []);

  const startTiming = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    progress.value = withTiming(
      1,
      { duration: MORPH_DURATION_MS, easing: Easing.inOut(Easing.cubic) },
      finished => {
        if (finished) runOnJS(clear)();
      },
    );
  }, [progress, clear]);

  const beginMorph = useCallback<MorphContextValue['beginMorph']>(
    ({ id, elements }) => {
      if (failsafeRef.current) clearTimeout(failsafeRef.current);
      startedRef.current = false;
      activeIdRef.current = id;
      progress.value = 0;
      setSnapshot({ id, elements: elements.map(el => ({ ...el, target: null })) });
      failsafeRef.current = setTimeout(() => {
        if (activeIdRef.current === id) clear();
      }, FAILSAFE_TIMEOUT_MS);
    },
    [progress, clear],
  );

  const setTarget = useCallback<MorphContextValue['setTarget']>(
    (id, key, target, targetText) => {
      if (activeIdRef.current !== id) return;
      setSnapshot(prev =>
        prev && prev.id === id
          ? {
              ...prev,
              elements: prev.elements.map(el =>
                el.key === key ? { ...el, target, targetText } : el,
              ),
            }
          : prev,
      );
      // Start as soon as the first target lands; siblings register in the same
      // layout pass, so they join from ~progress 0 without a visible jump.
      // Sources hide and clones become visible in this same commit.
      setFlyingId(id);
      startTiming();
    },
    [startTiming],
  );

  const cancelMorph = useCallback(() => {
    progress.value = 0;
    clear();
  }, [progress, clear]);

  const value = useMemo<MorphContextValue>(
    () => ({
      beginMorph,
      setTarget,
      cancelMorph,
      activeId: snapshot?.id ?? null,
      flyingId,
      progress,
    }),
    [beginMorph, setTarget, cancelMorph, snapshot?.id, flyingId, progress],
  );

  return (
    <MorphContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        <MorphOverlay snapshot={snapshot} flying={flyingId === snapshot?.id} progress={progress} />
      </View>
    </MorphContext.Provider>
  );
}

// While `flying` is false (held phase: tapped, destination not measured yet)
// the clones are mounted but fully transparent: the real card stays visible —
// so nothing can flicker — while images/fonts in the clones warm up.
function MorphOverlay({
  snapshot,
  flying,
  progress,
}: {
  snapshot: MorphSnapshot | null;
  flying: boolean;
  progress: SharedValue<number>;
}) {
  if (!snapshot) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {snapshot.elements.map(el =>
        el.node ? (
          <NodeMorphClone key={el.key} element={el} flying={flying} progress={progress} />
        ) : (
          <MorphClone key={el.key} element={el} flying={flying} progress={progress} />
        ),
      )}
    </View>
  );
}

// Flies an arbitrary node (e.g. avatar + name block) from source to target,
// uniformly scaled by the height ratio and pinned to the top-left corner.
function NodeMorphClone({
  element,
  flying,
  progress,
}: {
  element: MorphElement;
  flying: boolean;
  progress: SharedValue<number>;
}) {
  const s = element.source;
  const t = element.target ?? element.source;
  const held = !element.target;
  const scaleK = s.height > 0 ? t.height / s.height : 1;

  const style = useAnimatedStyle(() => {
    if (!flying) return { opacity: 0 };
    const p = progress.value;
    if (held) {
      // Destination never registered (no counterpart there): dissolve in place.
      return { opacity: interpolate(p, [0, 0.25], [1, 0], Extrapolation.CLAMP) };
    }
    const k = interpolate(p, [0, 1], [1, scaleK]);
    return {
      transform: [
        { translateX: interpolate(p, [0, 1], [0, t.x - s.x + (s.width * (scaleK - 1)) / 2]) },
        { translateY: interpolate(p, [0, 1], [0, t.y - s.y + (s.height * (scaleK - 1)) / 2]) },
        { scale: k },
      ] as const,
      opacity: interpolate(p, [0, 0.85, 1], [1, 1, 0], Extrapolation.CLAMP),
    };
  }, [element, scaleK, flying, held]);

  return (
    <Animated.View
      style={[styles.nodeClone, { left: s.x, top: s.y, width: s.width, height: s.height }, style]}
    >
      {element.node}
    </Animated.View>
  );
}

function inflate(frame: MorphFrame) {
  return {
    x: frame.x - frame.paddingHorizontal,
    y: frame.y - frame.paddingVertical,
    w: frame.width + frame.paddingHorizontal * 2,
    h: frame.height + frame.paddingVertical * 2,
  };
}

function MorphClone({
  element,
  flying,
  progress,
}: {
  element: MorphElement;
  flying: boolean;
  progress: SharedValue<number>;
}) {
  const source = element.source;
  // Until the destination registers, the clone is "held": target = source, so
  // every interpolation below is identity and it sits exactly on the origin.
  const target = element.target ?? element.source;
  const held = !element.target;
  const align = source.align ?? 'flex-start';
  const sourceText = element.text;
  const targetText = element.targetText ?? element.text;

  // Surface = the pill/card behind the text, inflated by padding around the
  // measured text rects.
  const s = inflate(source);
  const t = inflate(target);
  // Source layer grows UP to target scale; target layer starts shrunk DOWN.
  const upScale = target.fontSize / source.fontSize;
  const downScale = source.fontSize / target.fontSize;

  const surfaceStyle = useAnimatedStyle(() => {
    if (!flying || held) return { opacity: 0 };
    const p = progress.value;
    const sx = interpolate(p, [0, 1], [s.w / t.w, 1]);
    const sy = interpolate(p, [0, 1], [s.h / t.h, 1]);
    const tx = interpolate(p, [0, 1], [s.x + s.w / 2 - (t.x + t.w / 2), 0]);
    const ty = interpolate(p, [0, 1], [s.y + s.h / 2 - (t.y + t.h / 2), 0]);
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scaleX: sx }, { scaleY: sy }] as const,
      borderRadius: interpolate(p, [0, 1], [source.borderRadius, target.borderRadius]),
      backgroundColor: interpolateColor(
        p,
        [0, 1],
        [source.backgroundColor, target.backgroundColor],
      ),
      // Optional ease-in as it lifts off (see MorphStyle.surfaceFadeIn); always
      // fade out as the real destination crossfades in.
      opacity:
        (source.surfaceFadeIn ? interpolate(p, [0, 0.12], [0, 1], Extrapolation.CLAMP) : 1) *
        interpolate(p, [0.85, 1], [1, 0], Extrapolation.CLAMP),
    };
  }, [element, flying, held]);

  // SOURCE-look layer: laid out exactly like the origin (its text, its font
  // size, its wrapping). Flies toward the target while dissolving — so at the
  // moment of takeoff the clone is pixel-identical to what was on screen.
  const sourceTextStyle = useAnimatedStyle(() => {
    if (!flying) return { opacity: 0 };
    const p = progress.value;
    if (held) {
      // Destination never registered: dissolve in place.
      return { opacity: interpolate(p, [0, 0.25], [1, 0], Extrapolation.CLAMP) };
    }
    const sc = interpolate(p, [0, 1], [1, upScale]);
    let tx: number;
    let ty: number;
    if (align === 'center') {
      tx = interpolate(p, [0, 1], [0, target.x + target.width / 2 - (source.x + source.width / 2)]);
      ty = interpolate(
        p,
        [0, 1],
        [0, target.y + target.height / 2 - (source.y + source.height / 2)],
      );
    } else {
      // Pin top-left edges, accounting for the center-origin scale RN applies.
      tx = interpolate(p, [0, 1], [0, target.x - source.x + (source.width * (upScale - 1)) / 2]);
      ty = interpolate(p, [0, 1], [0, target.y - source.y + (source.height * (upScale - 1)) / 2]);
    }
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }] as const,
      opacity: interpolate(p, [0, 0.45], [1, 0], Extrapolation.CLAMP),
    };
  }, [element, align, upScale, flying, held]);

  // TARGET-look layer: laid out exactly like the destination. Starts shrunk at
  // the origin, fully transparent, and materializes mid-flight — appearance
  // morphs continuously instead of snapping at the start.
  const targetTextStyle = useAnimatedStyle(() => {
    if (!flying || held) return { opacity: 0 };
    const p = progress.value;
    const sc = interpolate(p, [0, 1], [downScale, 1]);
    let tx: number;
    let ty: number;
    if (align === 'center') {
      tx = interpolate(p, [0, 1], [source.x + source.width / 2 - (target.x + target.width / 2), 0]);
      ty = interpolate(
        p,
        [0, 1],
        [source.y + source.height / 2 - (target.y + target.height / 2), 0],
      );
    } else {
      tx = interpolate(
        p,
        [0, 1],
        [source.x + (target.width * downScale) / 2 - (target.x + target.width / 2), 0],
      );
      ty = interpolate(
        p,
        [0, 1],
        [source.y + (target.height * downScale) / 2 - (target.y + target.height / 2), 0],
      );
    }
    const fadeIn = interpolate(p, [0.2, 0.6], [0, 1], Extrapolation.CLAMP);
    const handOff = interpolate(p, [0.85, 1], [1, 0], Extrapolation.CLAMP);
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }] as const,
      opacity: fadeIn * handOff,
    };
  }, [element, align, downScale, flying, held]);

  const textAlignStyle = {
    justifyContent: align === 'center' ? ('center' as const) : ('flex-start' as const),
    alignItems: align === 'center' ? ('center' as const) : ('flex-start' as const),
  };

  return (
    <>
      <Animated.View
        style={[styles.clone, { left: t.x, top: t.y, width: t.w, height: t.h }, surfaceStyle]}
      />
      <Animated.View
        style={[
          styles.clone,
          styles.textWrap,
          {
            left: source.x,
            top: source.y,
            width: source.width,
            height: source.height,
          },
          textAlignStyle,
          sourceTextStyle,
        ]}
      >
        {element.sourceNode ?? (
          <Animated.Text
            style={[
              {
                fontSize: source.fontSize,
                color: source.textColor,
                textAlign: align === 'center' ? 'center' : 'left',
              },
              source.textStyle,
            ]}
          >
            {sourceText}
          </Animated.Text>
        )}
      </Animated.View>
      <Animated.View
        style={[
          styles.clone,
          styles.textWrap,
          {
            left: target.x,
            top: target.y,
            width: target.width,
            height: target.height,
          },
          textAlignStyle,
          targetTextStyle,
        ]}
      >
        <Animated.Text
          style={[
            {
              fontSize: target.fontSize,
              color: target.textColor,
              textAlign: align === 'center' ? 'center' : 'left',
            },
            target.textStyle,
          ]}
        >
          {targetText}
        </Animated.Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  clone: {
    position: 'absolute',
    overflow: 'hidden',
  },
  nodeClone: {
    position: 'absolute',
  },
  textWrap: {
    backgroundColor: 'transparent',
  },
});
