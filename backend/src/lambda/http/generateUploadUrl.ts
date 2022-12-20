import 'source-map-support/register'
import { AttachmentUtils } from '../../helpers/attachmentUtils'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { v4 as uuidv4 } from 'uuid';
import { getUserId } from '../utils'
import { updateAttachmentUrl } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo');

const attachmentUtils = new AttachmentUtils()
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info('Handling generateUploadUrl with event', {event});
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const attachmentId = uuidv4()
    const userId = getUserId(event)

    let uploadUrl = await attachmentUtils.createAttachmentPresignedUrl(attachmentId);

    const attachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId)

    await updateAttachmentUrl(userId, todoId, attachmentUrl)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
