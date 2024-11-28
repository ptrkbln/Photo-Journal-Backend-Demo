/* A valid email starts at least with 1 character (letters, numbers, or certain special characters (. _ % + -), followed by @, a domain name, and a dot, followed by at least 2 letters." */
export const emailValidator = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email); // true or false
};
