const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const getApiBaseUrl = () => API_BASE_URL;

export const parseStorageJson = (key) => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

export const getAuthSession = () => parseStorageJson("convocation.auth");
export const getStudentSession = () => parseStorageJson("convocation.student");

export const clearAuthSession = () => {
  localStorage.removeItem("convocation.auth");
};

export const clearStudentSession = () => {
  localStorage.removeItem("convocation.student");
};

export async function apiRequest(
  path,
  { method = "GET", body, token, headers = {} } = {},
) {
  const requestHeaders = {
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const responseData = await response
    .json()
    .catch(() => ({ message: "Unexpected response from server" }));

  if (!response.ok) {
    throw new Error(responseData?.message || "Request failed");
  }

  return responseData;
}
