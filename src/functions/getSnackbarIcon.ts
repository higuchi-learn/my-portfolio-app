export function getSnackbarIcon(message: string, isValidationWarning: boolean) {
  if (!message) {
    return "circle-check" as const;
  }

  if (isValidationWarning) {
    return "circle-alert" as const;
  }

  if (message.includes("失敗") || message.includes("エラー")) {
    return "triangle-alert" as const;
  }

  return "circle-check" as const;
}
