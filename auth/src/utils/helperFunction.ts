export const extractTokenFromUrl = (url: string) => {
  try {
    // Create a URL object from the provided URL
    const urlObject = new URL(url);

    // Get the value of the 'token' parameter from the URL
    const token = urlObject.searchParams.get('token');

    return token;
  } catch (error) {
    console.error('Error extracting token:', error.message);
    return null;
  }
};
