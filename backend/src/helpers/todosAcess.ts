import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    // handle get infor todo by User ID
    async getTodosByUserID(userId: string): Promise<TodoItem[]> {
        logger.info('call get Todos By UserID');
        const params = {
          TableName: this.todosTable,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          },
          ScanIndexForward: false
        }
    
        const result = await this.docClient.query(params).promise()
    
        return result.Items as TodoItem[]
      }

      
    // handle create todo
    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('call createTodo');
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        logger.info('create todo success: ' + todo);
        return todo
    }

    // handle update todo by user ID 
    async updateTodobyUserID(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info('call updateTodo');
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set #dynobase_name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done,
            },
            ExpressionAttributeNames: { "#dynobase_name": "name" }
        };

        await this.docClient.update(params).promise()
        logger.info('update to do success!: ' + todoUpdate);
        return todoUpdate
    }
    // update Attachment
    async updateAttachmentUrl(userId: string, todoId: string, uploadUrl: string): Promise<string> {
        logger.info('call TodosAccess.updateTodo'+ uploadUrl);
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': uploadUrl.split("?")[0]
            }
        };

        await this.docClient.update(params).promise()
        logger.info('Update attachment URL success: ' + uploadUrl);
        return uploadUrl
    }
    
    // handle delete todo by UserID
    async deleteTodo(userId: string, todoId: string) {
        logger.info('call deleteTodo');
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        };

        await this.docClient.delete(params).promise()
        logger.info('result: done');
    }
}
    function createDynamoDBClient() {
        if (process.env.IS_OFFLINE) {
            logger.info('Creating a local DynamoDB instance')
            return new XAWS.DynamoDB.DocumentClient({
                region: 'localhost',
                endpoint: 'http://localhost:8000'
            })
        }
    
        return new XAWS.DynamoDB.DocumentClient()
    }

