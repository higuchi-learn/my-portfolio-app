export function getSnackbarColor(message: string, isValidationWarning: boolean): LkColorWithOnToken {
  if (!message) {
    return "surface";
  }

  if (isValidationWarning) {
    return "errorcontainer";
  }

  if (message.includes("失敗") || message.includes("エラー")) {
    return "error";
  }

  return "surface";
}
