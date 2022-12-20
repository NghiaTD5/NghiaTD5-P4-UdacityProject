import { TodosAccess } from '../helpers/todosAcess'
import { TodoUpdate } from '../models/TodoUpdate'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { getUserId } from '../lambda/utils';
import * as uuid from 'uuid'


// TODO: Implement businessLogic
const logger = createLogger('businessLogic-todos')
const todosAccess = new TodosAccess()

// Get info todo by UserID
export async function getTodosByUserID(userId: string): Promise<TodoItem[]> {
    logger.info('call # getTodosByUserId: ', userId)
    const todo = await todosAccess.getTodosByUserID(userId)
    return todo
}

// Create new todo
export async function createTodo(event: APIGatewayProxyEvent, createTodoRequest: CreateTodoRequest) {
  logger.info('call function createtodo with event: '+ event + 'and  createTodoRequest is:' + createTodoRequest)
  const todoId = uuid.v4();
  const userId = await getUserId(event);
  const createdAt = new Date(Date.now()).toISOString();

  const todoItem = {
      userId,
      todoId,
      createdAt,
      done: false,
      ...createTodoRequest
  };
  await todosAccess.createTodo(todoItem);
  return todoItem;
}

  // Update todo by UserID and todoID
  export async function updateTodobyUserID(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<TodoUpdate> {
    let todoUpdate: TodoUpdate = {
      ...updatedTodo
    }
    const todo = await todosAccess.updateTodobyUserID(userId, todoId, todoUpdate);
    logger.info('call updateTodo with userID is: ' + userId + ', todoID is:' + todoId + 'and todoUpdate is:' + todoUpdate);
    return todo
  }

  // Delete todo by UserID and todoID
  export async function deleteTodo(userId: string, todoId: string) {
    logger.info('call deleteTodo with UserID is:' + userId + "and todoID is:" + todoId);
    return todosAccess.deleteTodo(userId, todoId)
    
  }

  // Update AttachmentUrl by UserID and todoID
  export async function updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string): Promise<string> {
    logger.info('call todos.updateTodo: ' + userId + "," + todoId + "," + attachmentUrl);
    return todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
  }