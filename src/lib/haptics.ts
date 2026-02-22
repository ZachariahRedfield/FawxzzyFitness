const PATTERNS = {
  press: 10,
  success: [18, 18, 28],
  error: [30, 22, 30],
} as const;

function canVibrate() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function triggerHaptic(pattern: VibratePattern) {
  if (!canVibrate()) {
    return false;
  }

  return navigator.vibrate(pattern);
}

export function triggerPressHaptic() {
  return triggerHaptic(PATTERNS.press);
}

export function triggerSuccessHaptic() {
  return triggerHaptic([...PATTERNS.success]);
}

export function triggerErrorHaptic() {
  return triggerHaptic([...PATTERNS.error]);
}
