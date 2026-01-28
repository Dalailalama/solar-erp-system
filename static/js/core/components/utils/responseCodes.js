// Response Code System - Standardized API response codes
export const RESPONSE_CODES = {
    // Success codes (1-3)
    SUCCESS: 1,                    // General success
    CREATED: 2,                    // Resource created
    UPDATED: 3,                    // Resource updated

    // Error codes (0, 4-9)
    ERROR: 0,                      // General error
    VALIDATION_ERROR: 4,           // Validation failed
    NOT_FOUND: 5,                  // Resource not found
    UNAUTHORIZED: 6,               // Not authorized
    FORBIDDEN: 7,                  // Forbidden access
    SERVER_ERROR: 8,               // Server error
    NETWORK_ERROR: 9               // Network/connection error
};

// Response code messages
export const RESPONSE_MESSAGES = {
    [RESPONSE_CODES.SUCCESS]: 'Operation successful',
    [RESPONSE_CODES.CREATED]: 'Created successfully',
    [RESPONSE_CODES.UPDATED]: 'Updated successfully',
    [RESPONSE_CODES.ERROR]: 'An error occurred',
    [RESPONSE_CODES.VALIDATION_ERROR]: 'Validation failed',
    [RESPONSE_CODES.NOT_FOUND]: 'Resource not found',
    [RESPONSE_CODES.UNAUTHORIZED]: 'Unauthorized access',
    [RESPONSE_CODES.FORBIDDEN]: 'Access forbidden',
    [RESPONSE_CODES.SERVER_ERROR]: 'Server error occurred',
    [RESPONSE_CODES.NETWORK_ERROR]: 'Network connection error'
};

// Response code to toast type mapping
export const CODE_TO_TOAST_TYPE = {
    [RESPONSE_CODES.SUCCESS]: 'success',
    [RESPONSE_CODES.CREATED]: 'success',
    [RESPONSE_CODES.UPDATED]: 'success',
    [RESPONSE_CODES.ERROR]: 'error',
    [RESPONSE_CODES.VALIDATION_ERROR]: 'warning',
    [RESPONSE_CODES.NOT_FOUND]: 'error',
    [RESPONSE_CODES.UNAUTHORIZED]: 'error',
    [RESPONSE_CODES.FORBIDDEN]: 'error',
    [RESPONSE_CODES.SERVER_ERROR]: 'error',
    [RESPONSE_CODES.NETWORK_ERROR]: 'error'
};

/**
 * Handle API response based on code
 * @param {Object} response - API response with code and message
 * @param {Function} toast - Toast function
 * @param {boolean} showToast - Whether to show toast
 * @returns {boolean} True if success code, false if error code
 */
export function handleResponseCode(response, toast, showToast = true) {
    const code = response.code || response.status_code || RESPONSE_CODES.ERROR;
    const message = response.message || RESPONSE_MESSAGES[code];

    // Determine if success or error
    const isSuccess = code >= 1 && code <= 3;

    if (showToast && toast) {
        const toastType = CODE_TO_TOAST_TYPE[code] || 'info';
        toast[toastType](message);
    }

    return isSuccess;
}

/**
 * Check if response code indicates success
 * @param {number} code - Response code
 * @returns {boolean} True if success code
 */
export function isSuccessCode(code) {
    return code >= 1 && code <= 3;
}

/**
 * Check if response code indicates error
 * @param {number} code - Response code
 * @returns {boolean} True if error code
 */
export function isErrorCode(code) {
    return code === 0 || code >= 4;
}
