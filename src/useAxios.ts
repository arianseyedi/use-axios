import { useState, useEffect } from 'react'
import Axios, { AxiosRequestConfig, CancelToken, AxiosPromise } from 'axios'
import { UseAxiosReturnType, UseAxiosState, UseAxiosBaseOptions } from './types'
import { config } from './config'

const defaultState: UseAxiosState<any> = {
  loading: false,
  error: false,
}

/**
 * @function returns the data as the result of a single configured axios call. For a single component with multiple fetches, do not use this hook.
 * @param config axios configurations
 * @param transformer the data transformer pertaining to the shape of the expected response
 * @param axiosPromiseConstructor axios constructor. Creates the axios object ready for configuration
 * @param options useAxios options. For polling, please pass this option from the initial render of this hook.
 * @author Arian Seyedi
 */
function useAxiosBase<R>(
  config: AxiosRequestConfig,
  axiosPromiseConstructor: <T>(
    config: AxiosRequestConfig,
    cancelToken: CancelToken
  ) => AxiosPromise<T>,
  options?: UseAxiosBaseOptions
): UseAxiosReturnType<R> {
  const [state, setState] = useState<UseAxiosState<R>>(defaultState) // simple one time fetch (either - or basis)
  const [redo, setRedo] = useState<number>(0)
  const [intervalState, setIntervalState] = useState<UseAxiosState<R>>(defaultState) // interval fetch (either - or basis)
  const { url } = config
  const { skip, pollingInterval } = options || {}

  const handleIncrementRedo = () => {
    setRedo((redo + 1) % 2)
  }

  useEffect(() => {
    const source = Axios.CancelToken.source()
    const loadData = async () => {
      if (pollingInterval) setIntervalState({ error: false, loading: true })
      else setState({ error: false, loading: true })

      try {
        const response = await axiosPromiseConstructor<R>(config, source.token)
        // either polls or not, if polling then pollingData state is constantly updated
        if (pollingInterval)
          setIntervalState({
            error: false,
            loading: false,
            data: response.data,
          })
        else setState({ error: false, loading: false, data: response.data })
      } catch (error) {
        if (Axios.isCancel(error)) {
          console.warn('use axios call cancelled: ', error)
          // do something when axios is cancelled
        } else {
          if (pollingInterval) setIntervalState({ error: true, loading: false })
          else setState({ error: true, loading: false })
        }
      }
    }

    let id: NodeJS.Timeout

    if (!skip && !pollingInterval) {
      loadData()
      return () => {
        source.cancel()
      }
    }
    if (!skip && pollingInterval) {
      if (!intervalState.data) {
        // if no data at hand, initialize fetch just like in a normal case
        loadData()
      } else {
        // start polling on the second rount
        id = setInterval(loadData, pollingInterval)
      }
    }
    return () => {
      // polling cleanup
      clearInterval(id)
      source.cancel()
    }
  }, [url, redo, skip, intervalState.data]) // watch for intervalData especially because refetch is required after each poll

  return intervalState.data
    ? [
        {
          data: intervalState.data,
          error: intervalState.error,
          loading: intervalState.loading,
        },
        handleIncrementRedo,
      ]
    : state.data
    ? [
        {
          data: state.data,
          error: state.error,
          loading: state.loading,
        },
        handleIncrementRedo,
      ]
    : [{ data: undefined, error: state.error, loading: state.loading }, handleIncrementRedo]
}

/**
 * @function returns the data as the result of a single configured axios call. For a single component with multiple fetches, do not use this hook.
 * @param requestConfig axios configurations
 * @param transformer the data transformer pertaining to the shape of the expected response
 * @param options useAxios options. For polling, please pass this option from the initial render of this hook.
 * @author Arian Seyedi
 */
export function useAxios<R>(
  requestConfig: AxiosRequestConfig,
  options?: UseAxiosBaseOptions
): UseAxiosReturnType<R> {
  return useAxiosBase(requestConfig, config.getInstance(), options)
}
