const convertToISTDateTime = (dateString: string) => {
  // Split the input string to extract year, month, and day
  const [year, month, day] = dateString.split('-').map(Number);
  const localDateTime = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  const currentTimeIST = localDateTime.toLocaleString('en-US', options);

  let resultDateString = `${year}-${month}-${day}`;

  const result = `${resultDateString}, ${currentTimeIST}`; // Replace this string with your obtained date-time string
  const ISTDateTimeString = result;
  const [datePart, timePart] = ISTDateTimeString.split(', ');
  const [year1, month1, day1] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  // Creating a Date object in local time
  const convertedDateTime = new Date(
    year1,
    month1 - 1,
    day1,
    hours - 1,
    minutes,
    seconds,
  );

  // Get the UTC time of the local date-time
  return convertedDateTime;
};

export { convertToISTDateTime };
