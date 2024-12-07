/*   Validator for captions:
Allows only letters (both uppercase and lowercase), numbers, certain special characters (.,:;!?()⁻^), and whitespace (spaces, tabs, newlines). Ensures the caption is between 2 to 200 characters long. */

export const captionValidator = (caption) => {
  const regex = /^[A-Za-z0-9.,:;!?()^-\s]{2,200}$/;
  return regex.test(caption);
};
