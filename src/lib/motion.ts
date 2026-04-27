export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const mapRange = (
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
  clampOutput = true,
) => {
  if (Math.abs(inputMin - inputMax) < Number.EPSILON) return outputMin
  const outVal = ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin
  return clampOutput
    ? clamp(outVal, Math.min(outputMin, outputMax), Math.max(outputMin, outputMax))
    : outVal
}
