import { promisify } from 'util'
import redis from 'redis'
import { list } from 'redis-commands'
import Client from '@blued-core/client'

export default class RedisClient extends Client {
  buildClient (key: string) {
    const { host, port } = this.conf.get(key)
    const client = createRedisClient(host, port)

    return {
      client,
      clean () {
        client.quit()
      },
    }
  }
}

/**
 * 创建redis客户端连接
 * @param {string} host redis对应的IP
 * @param {number} port 创建链接的端口
 * @return {RedisClient}
 */
function createRedisClient (host: string, port = 6379) {
  const redisClient = redis.createClient(port, host)

  // build promisify methods
  const redisPromisifyClient = build(redisClient)

  return redisPromisifyClient
}

/**
 * 将 Redis 命令转换为 Promise 版本
 * @param {any} target RedisClient
 * @return {any}
 */
function build (target: any) {
  list.forEach((method: any) => {
    const func = target[method]
    if (typeof func === 'function') {
      target[method] = promisify(func)
      target[method.toUpperCase()] = promisify(func)
    }
  })

  return target
}