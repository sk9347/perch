const isDateOfBirthValid = (dobDate: Date) => {
  const now = new Date();
  const eighteenYearsAgo = new Date(
    now.getFullYear() - 18,
    now.getMonth(),
    now.getDate(),
  );

  // Check if the provided date is a valid date and the user is at least 18 years old
  if (
    isNaN(dobDate.getTime()) || // Check if the date is invalid
    dobDate > now || // Check if the date is in the future
    dobDate >= eighteenYearsAgo // Check if the user is less than 18 years old
  ) {
    return false;
  }
  return true;
};

const isDateOfJoiningValid = (dojDate: Date) => {
  const resultantDojDate = new Date(dojDate);

  // Check if the provided date is a valid date and the user is at least 18 years old
  if (isNaN(resultantDojDate.getTime())) {
    return false;
  }
  return true;
};
export { isDateOfBirthValid, isDateOfJoiningValid };
