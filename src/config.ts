import { Config } from './types'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export const config = ((): Config => {
  let _axios_instance: AxiosInstance

  const setInstance = (config: AxiosRequestConfig) => {
    _axios_instance = axios.create(config)
  }

  const getInstance = () => {
    if (!_axios_instance) {
      _axios_instance = axios.create()
      return _axios_instance
    }
    return _axios_instance
  }

  return {
    setInstance: (config: AxiosRequestConfig) => setInstance(config),
    getInstance: () => getInstance(),
  }
})()
