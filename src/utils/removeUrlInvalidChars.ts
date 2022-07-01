const pattern = /[^a-zA-Z0-9\-_.]/g;
export function removeUrlInvalidChars(text: string): string {
    return text.replace(pattern, '');
}
