import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
const logger = createLogger('auth')
// import { secretsManager } from 'middy/middlewares'
// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const secretId = process.env.AUTH_0_SECRET_ID
// const secretField = process.env.AUTH_0_SECRET_FIELD

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const cert = `-----BEGIN CERTIFICATE-----
  MIIDHTCCAgWgAwIBAgIJFFUA37zELAIhMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
  BAMTIWRldi0xNmJrZ2IwNjZ0NWVicHlzLnVzLmF1dGgwLmNvbTAeFw0yMjEyMTAw
  MjE3NTZaFw0zNjA4MTgwMjE3NTZaMCwxKjAoBgNVBAMTIWRldi0xNmJrZ2IwNjZ0
  NWVicHlzLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
  ggEBAMbCCle155v2mBUEjbpjt8JOuqELUo29ntmj5qxeUYjIM6VPGf5KzR3QNTu6
  MdpPsHC1FojPCdlBViPKUc+93b94EUnVPNG1pxHzZ+B/b5l2Dvy2nubwuuaAqhn/
  uPlIEjkrdDZUyNrGjD2wBz0bVKxy41ro6ceotsE5cbzkZS1Vl0d7aFGHKry5KWTj
  DJTC+GYHj5Kw8NpEGeQtmlADWkd9xpaunkpAg1sGOAgVCnYHQ2P8EKW9gYaYl8l6
  HfmIXO7Tn2DGh2ALhMlTLS5L10pr2kJOp0+YZsnYIOl9PDDvQjwR/F4X8+qfW6qu
  xS8//tC0Og9vdzSHulwiMfcxoAUCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
  BgNVHQ4EFgQUwBfvWXAXPuvOE6HlgTLy716v9NwwDgYDVR0PAQH/BAQDAgKEMA0G
  CSqGSIb3DQEBCwUAA4IBAQAoJsJbhM7VtqTSZl3e1V1D7cKeq39o4jcRxIokgb1y
  Qut1TaeVgIOh3v2pv8QSv9Lxry3Z2Kc8iJtGTrblHa6U0D3QTF1MKRLMDZVKwxwo
  VMaL/iLeFWU8YX0Y6rUnBaPKmRf9mKNTxmWDEfvgwyNulF3bCICVO8q9apl9lpS/
  Lot/waRCpldQ14eppwIgwqOTpb9ubl0Du/Nojt8GsOCNX+VFd0MswsidNBL8i5pd
  gO6ZZfEFD9pxtZdImmlKNNF+AzIYlkyiRucSw8MRf1yHAogCjRPrgA0vJ0J7SgQo
  XiKOiOVz8NcptsjJen8ah0A03mPdlGho7oUURUHNsXBI
  -----END CERTIFICATE-----`
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

