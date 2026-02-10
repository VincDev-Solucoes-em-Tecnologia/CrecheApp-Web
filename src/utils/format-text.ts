export function capitalizeFirstLetter(value: string) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function capitalizeWords(value: string) {
  if (!value) return '';
  return value.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}
