import { TodosAccess } from '../helpers/todosAcess'
// import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'


// TODO: Implement businessLogic
const logger = createLogger('businessLogic-todos')
const todosAccess = new TodosAccess()

// Get info todo by UserID
export async function getTodosByUserID(userId: string): Promise<TodoItem[]> {
    const todo = await todosAccess.getTodosByUserID(userId)
    logger.info('call # getTodosByUserId: ', userId)
    return todo
}

// Create new todo
export async function createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()  
    let newItem: TodoItem = {
      userId,
      todoId,
      createdAt,
      done: false,
      ...newTodo,
      attachmentUrl: ''
    }
    const todo = await todosAccess.createTodo(newItem)
    logger.info('call function todos.createTodo: ' + todo)
    return todo
  }

  // Update todo by UserID and todoID
  export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<TodoUpdate> {
    let todoUpdate: TodoUpdate = {
      ...updatedTodo
    }
    const todo = await todosAccess.updateTodo(userId, todoId, todoUpdate);
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