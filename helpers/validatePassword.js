/* Minimum eight characters, maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character (# ? !) */
export const passwordValidator = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  return regex.test(password); // true or false
};
