import axios from 'axios';

// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===============================
// 🎨 Color Debug Helper
// ===============================
const debug = {
  req: (config) => {
    console.log(
      `%c🚀 REQUEST → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      'color: #ff8c00; font-weight: bold;'
    );
    console.log('%c📦 Payload:', 'color: #03a9f4;', config.data || {});
    console.log('%c🔐 Headers:', 'color: #8e44ad;', config.headers || {});
  },

  res: (response) => {
    console.log(
      `%c📥 RESPONSE ← ${response.config.method?.toUpperCase()} ${response.config.url} ✔`,
      'color: #4caf50; font-weight: bold;'
    );
    console.log('%c📊 Data:', 'color: #009688;', response.data);
    console.log('%c📌 Status:', 'color: #795548;', response.status);
  },

  err: (error) => {
    console.error(
      `%c❌ ERROR: ${error?.response?.status || ''} ${error?.config?.url || ''}`,
      'color: red; font-weight: bold;'
    );
    console.error('%c📋 Details:', 'color: #c62828;', error);
  },
};

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug Request
    debug.req(config);

    return config;
  },
  (error) => {
    debug.err(error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors & 401
axiosInstance.interceptors.response.use(
  (response) => {
    // Debug Response
    debug.res(response);

    const originalData = response.data;

    // If backend indicates failure, reject the promise
    if (originalData.success === false) {
      return Promise.reject({
        message: originalData.message || 'Request failed',
        status: response.status,
        original: response,
      });
    }

    // Unwrap the data for successful responses
    response.data = originalData.data;
    response.success = originalData.success;
    response.message = originalData.message;

    return response;
  },
  (error) => {
    // Debug Error
    debug.err(error);

    const status = error?.response?.status;

    // Network Error or No Server Response
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection or try again later.',
        status: null,
        original: error,
      });
    }

    // Unauthorized Error
    if (status === 401) {
      if (window.location.pathname !== '/login') {
        [
          'userDetails',
          'userId',
          'userName',
          'userEmail',
          'userRole',
          'branchId',
          'token',
        ].forEach((item) => localStorage.removeItem(item));

        window.location.href = '/login';
      }

      return Promise.reject({
        message: 'Session expired. Please login again.',
        status,
        original: error,
      });
    }

    if (status === 400) {
      return Promise.reject({
        message: error?.response?.data?.message || 'Bad Request',
        status,
        original: error,
      });
    }

    if (status === 403) {
      return Promise.reject({
        message: 'Access denied. You do not have permission.',
        status,
        original: error,
      });
    }

    if (status === 404) {
      return Promise.reject({
        message: 'Requested resource not found.',
        status,
        original: error,
      });
    }

    if (status >= 500) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        status,
        original: error,
      });
    }

    return Promise.reject({
      message: error?.response?.data?.message || 'Unexpected error occurred.',
      status,
      original: error,
    });
  }
);

export default axiosInstance;
