import { AxiosRequestConfig, AxiosInstance } from 'axios'

/**
 * @interface UseAxios Options
 * @field skip will skip fetch if true
 * @field pollingInterval the polling interval (milisecond) at which point polling will repeat. No polling will take place if this option is missing
 */
export interface UseAxiosBaseOptions {
  skip?: boolean
  pollingInterval?: number
}
export const defaultUseAxiosOptions: UseAxiosBaseOptions = {
  skip: false,
}

export type UseAxiosState<T> = {
  data?: T
  loading: boolean
  error: boolean
}

export type Refetch = () => void

export type UseAxiosReturnType<T> = [UseAxiosState<T>, Refetch]

export type UseAxiosMultiState = {
  data: any[] | null
  loading: boolean
  error: boolean
}

export type UseAxiosMultiReturnType = [UseAxiosMultiState, Refetch]

/**
 * This library's configurer
 *
 * @export
 * @interface Config
 */
export interface Config {
  /**
   * Sets the axios instance using the given config object, useAxios hooks of this library use this instance for further API calls.
   * It is not mandatory that you configure a base instance to start with. If not set, a fresh instance of axios will be used with
   * an empty conifguration
   * object.
   *
   * @memberof Config
   */
  setInstance: (config: AxiosRequestConfig) => void
  getInstance: () => AxiosInstance
}
