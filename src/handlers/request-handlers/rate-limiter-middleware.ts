import { NextFunction, Request, Response } from 'express'
import { createLogger } from '../../factories/logger-factory.ts'
import { createSettings } from '../../factories/settings-factory.ts'
import { getRemoteAddress } from '../../utils/http.ts'
import { Settings } from '../../@types/settings.ts'
import { slidingWindowRateLimiterFactory } from '../../factories/rate-limiter-factory.ts'

const debug = createLogger('rate-limiter-middleware')

export const rateLimiterMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  const currentSettings = createSettings()

  const clientAddress = getRemoteAddress(request, currentSettings).split(',')[0]

  debug('request received from %s: %O', clientAddress, request.headers)

  if (await isRateLimited(clientAddress, currentSettings)) {
    response.destroy()

    return
  }

  next()
}

export async function isRateLimited(remoteAddress: string, settings: Settings): Promise<boolean> {
  const {
    rateLimits,
    ipWhitelist = [],
  } = settings.limits?.connection ?? {}

  if (typeof rateLimits === 'undefined') {
    return false
  }

  if (ipWhitelist.includes(remoteAddress)) {
    return false
  }
  const rateLimiter = await slidingWindowRateLimiterFactory()

  const hit = (period: number, rate: number) =>
    rateLimiter.hit(
      `${remoteAddress}:connection:${period}`,
      1,
      { period: period, rate: rate },
    )

  let limited = false
  for (const { rate, period } of rateLimits) {
    const isRateLimited = await hit(period, rate)

    if (isRateLimited) {
      debug('rate limited %s: %d messages / %d ms exceeded', remoteAddress, rate, period)

      limited = true
    }
  }

  return limited
}
