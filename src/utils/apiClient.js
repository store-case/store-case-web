export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const parseJson = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const resolveToken = (token) => {
  if (typeof token === 'string') {
    return token
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('accessToken') || ''
  }
  return ''
}

export const apiRequest = async ({
  url,
  method = 'GET',
  data,
  headers = {},
  token,
  skipAuth = false,
  credentials = 'include',
} = {}) => {
  const finalHeaders = { ...headers }
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData

  if (!isFormData) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json'
  }

  if (!skipAuth) {
    const resolvedToken = resolveToken(token)
    if (resolvedToken) {
      finalHeaders.Authorization = resolvedToken
    }
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    credentials,
    body: data === undefined ? undefined : isFormData ? data : JSON.stringify(data),
  })

  const payload = await parseJson(response)

  if (!response.ok) {
    const errorMessage = payload?.message || '요청에 실패했습니다.'
    throw new ApiError(errorMessage, response.status, payload)
  }

  return payload
}

export const apiClient = {
  request: apiRequest,
  get: (url, options) => apiRequest({ url, method: 'GET', ...options }),
  post: (url, data, options) => apiRequest({ url, method: 'POST', data, ...options }),
  put: (url, data, options) => apiRequest({ url, method: 'PUT', data, ...options }),
  patch: (url, data, options) => apiRequest({ url, method: 'PATCH', data, ...options }),
  delete: (url, options) => apiRequest({ url, method: 'DELETE', ...options }),
}
