export function validateInput(inputValue: string) {
  const inputLength = inputValue.length;
  const alphaCharPattern = /[a-zA-Z]/;

  if (!alphaCharPattern.test(inputValue)) {
    return { isValid: false, message: "⚠️ Input should only contain alphabetic characters." };
  }

  if (inputLength < 10 || inputLength > 200) {
    return { isValid: false, message: " ⚠️ Input should be between 10 and 200 characters." };
  }

  return { isValid: true, message: "" };
}

export function validateName(inputValue: string) {
  const alphaCharPattern = /[a-zA-Z]/;

  if (!alphaCharPattern.test(inputValue)) {
    return { isValid: false, message: "⚠️ Input should only contain alphabetic characters." };
  }

  return { isValid: true, message: "" };
}
