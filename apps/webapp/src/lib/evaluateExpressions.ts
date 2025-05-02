export function evaluateExpression(input: string): number | null {
  try {
    // Use Function to evaluate the expression safely
    const result = new Function(`return ${input}`)();
    if (typeof result === 'number' && !Number.isNaN(result)) {
      return result;
    }
    return null; // Return null if the result is not a valid number
  } catch (error) {
    console.error('Invalid expression:', input);
    return null; // Return null for invalid expressions
  }
}
