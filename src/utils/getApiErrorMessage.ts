
import axios from 'axios';

export const getApiErrorMessage = (
  error: unknown,
): string => {
  if (!axios.isAxiosError(error)) {
    return 'An unexpected error occurred.';
  }

  // Sem resposta HTTP: servidor indisponível ou erro de rede.
  if (!error.response) {
    return 'Unable to connect to the server.';
  }

  const status = error.response.status;

  switch (status) {
    case 400:
      return 'Please check the provided information.';

    case 401:
      return 'Authentication is required.';

    case 403:
      return 'You do not have permission to perform this action.';

    case 404:
      return 'User not found.';

    case 409:
      return 'Email is already registered.';

    case 500:
      return 'Server error. Please try again later.';

    default:
      return 'An unexpected error occurred.';
  }
};
