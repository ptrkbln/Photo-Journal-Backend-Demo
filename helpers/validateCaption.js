/* Allows only letters (both uppercase and lowercase), numbers, certain special characters (.,:;!?()⁻^), and whitespace (spaces, tabs, newlines) and a length 2-200 characters */

export const captionValidator = (caption) => {
  const regex = /^[A-Za-z0-9.,:;!?()^-\s]{2,200}$/;
  return regex.test(caption);
};
