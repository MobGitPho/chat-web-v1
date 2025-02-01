import { MessageStatus } from '@/enums/message-status'
import { UserModel } from './user'
import { GroupModel } from './group'

export class MessageModel {
    id?: number
    senderId?: number
    receiverId?: number
    content?: string | null
    attachment?: string | null
    attachmentUrl?: string | null
    status?: MessageStatus

    sender?: UserModel
    receiver?: UserModel
    group?: GroupModel[]
    readAt?: string | null
    deletedAt?: string | null
    createdAt?: string
    updatedAt?: string

    constructor(
        id?: number,
        senderId?: number,
        receiverId?: number,
        status: MessageStatus = MessageStatus.SENT,
        content?: string | null,
        attachment?: string | null,

        readAt?: string | null,
        deletedAt?: string | null,
        createdAt?: string,
        updatedAt?: string
    ) {
        this.id = id
        this.senderId = senderId
        this.receiverId = receiverId
        this.content = content
        this.status = status
        this.attachment = attachment

        this.readAt = readAt
        this.deletedAt = deletedAt
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }
}