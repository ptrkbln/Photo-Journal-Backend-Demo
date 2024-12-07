/* 
  Validator for usernames:
  - Must be between 3 and 16 characters long.
  - Starts with a letter and can contain letters, numbers, or underscores.
*/
export const usernameValidator = (username) => {
  const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
  return regex.test(username); // true or false
};
