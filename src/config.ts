import { Config } from './types'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export const config = ((): Config => {
  let _axios_instance: AxiosInstance

  const setInstanceWithConfig = (config: AxiosRequestConfig) => {
    _axios_instance = axios.create(config)
  }

  const setInstance = (instance: AxiosInstance) => {
    _axios_instance = instance
  }

  const getInstance = () => {
    if (!_axios_instance) {
      _axios_instance = axios.create()
      return _axios_instance
    }
    return _axios_instance
  }

  return {
    setInstance: (config: AxiosRequestConfig | AxiosInstance) =>
      (config as AxiosRequestConfig).adapter
        ? setInstanceWithConfig(config as AxiosRequestConfig)
        : setInstance(config as AxiosInstance),
    getInstance: () => getInstance(),
  }
})()
