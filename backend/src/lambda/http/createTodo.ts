import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Implement creating a new TODO item
    logger.info('Handling createTodo event', {event});
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    if(newTodo.name.trim()=="" || !newTodo.name){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `name is a required field`
        })
      }
    }
    if(newTodo.dueDate.trim()=="" || !newTodo.dueDate){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Due is a required field`
        })
      }
    }
    const todo = await createTodo(event, newTodo)
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item:todo
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
