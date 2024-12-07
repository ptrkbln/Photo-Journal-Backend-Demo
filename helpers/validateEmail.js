/*  Validator for email:
  - Starts with at least one character (letters, numbers, or special characters like . _ % + -).
  - Contains "@" symbol followed by a domain name and a dot.
  - Ends with at least two letters (e.g., ".com").
*/
export const emailValidator = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email); // true or false
};
