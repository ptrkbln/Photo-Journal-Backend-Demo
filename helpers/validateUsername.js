/* Must be between 3 and 16 characters long, start with a letter, can contain letters, numbers or underscores */

export const usernameValidator = (username) => {
  const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
  return regex.test(username); // true or false
};
