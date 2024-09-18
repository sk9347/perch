const patterns = {
  CONTACT_NUMBER: /^[6-9]\d{9}$/,
  DOB: /^(19|20|21)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
  FULL_NAME: /^[A-Za-z]+(?:\s[A-Za-z]+)*(?:\s*\.[A-Za-z])?$/,
  WHITESPACE: /^(?!\s*$).+/,
  EMAIL: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
  DOJ: /^(19|20|21)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
  ADDRESS1: /^[A-Za-z0-9\s\-.,'"/#]+$/,
  ADDRESS2: /^[A-Za-z0-9\s\-.,:'"/#]+$/,
  COMMON: /^[A-Za-z\s.'-]+$/,
  PINCODE: /^\d{6}$/,
  ORGANISATION_NAME: /^[A-Za-z]{1}[A-Za-z0-9\s.@*!#$^'&,-]+$/i,
  WEBSITE: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  DOMAIN: /^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/,
};
export default patterns;
