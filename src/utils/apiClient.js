import { API_ENDPOINTS } from '../constants/api'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const ACCESS_TOKEN_KEY = 'accessToken'
const TOKEN_REFRESH_EVENT = 'auth:token-refresh'
let refreshPromise = null

const parseJson = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const getStoredAccessToken = () => {
  if (typeof localStorage === 'undefined') {
    return ''
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY) || ''
}

const persistAccessToken = (token) => {
  if (typeof localStorage === 'undefined') {
    return
  }
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
}

const notifyTokenRefresh = (token) => {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new CustomEvent(TOKEN_REFRESH_EVENT, { detail: token || '' }))
}

const resolveToken = (token) => {
  if (typeof token === 'string' && token.trim()) {
    return token
  }
  return getStoredAccessToken()
}

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(API_ENDPOINTS.auth.refresh, {
        method: 'POST',
        credentials: 'include',
      })
      const payload = await parseJson(response)
      if (!response.ok) {
        const message = payload?.message || '토큰 갱신에 실패했습니다.'
        throw new ApiError(message, response.status, payload)
      }
      const nextToken = payload?.data?.accessToken || payload?.accessToken
      if (!nextToken) {
        throw new ApiError('새로운 액세스 토큰을 확인할 수 없습니다.', response.status, payload)
      }
      persistAccessToken(nextToken)
      notifyTokenRefresh(nextToken)
      return nextToken
    })()
      .catch((error) => {
        persistAccessToken('')
        notifyTokenRefresh('')
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
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
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData

  const performRequest = async (authToken) => {
    const finalHeaders = { ...headers }

    if (!isFormData) {
      finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json'
    }

    if (!skipAuth && authToken) {
      finalHeaders.Authorization = authToken
    }

    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      credentials,
      body: data === undefined ? undefined : isFormData ? data : JSON.stringify(data),
    })

    const payload = await parseJson(response)
    return { response, payload }
  }

  let authToken = !skipAuth ? resolveToken(token) : ''
  let shouldRetry = !skipAuth

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { response, payload } = await performRequest(authToken)
    if (response.ok) {
      return payload
    }

    const errorMessage = payload?.message || '요청에 실패했습니다.'

    if (shouldRetry && response.status === 401) {
      try {
        authToken = await refreshAccessToken()
        shouldRetry = false
        continue
      } catch (refreshError) {
        throw refreshError
      }
    }

    throw new ApiError(errorMessage, response.status, payload)
  }

  throw new ApiError('요청을 처리할 수 없습니다.', 500)
}

export const apiClient = {
  request: apiRequest,
  get: (url, options) => apiRequest({ url, method: 'GET', ...options }),
  post: (url, data, options) => apiRequest({ url, method: 'POST', data, ...options }),
  put: (url, data, options) => apiRequest({ url, method: 'PUT', data, ...options }),
  patch: (url, data, options) => apiRequest({ url, method: 'PATCH', data, ...options }),
  delete: (url, options) => apiRequest({ url, method: 'DELETE', ...options }),
}
